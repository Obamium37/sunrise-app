"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { 
  getTemplateByAppType, 
  initializeFormState, 
  getCharacterCount,
  templateHasSections,
  getFieldsForSection,
  getCategoriesForSection,
  getMaxItemsForSection
} from "../../lib/activityTemplates";

export default function ActivityListsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Track which application types the user has colleges for
  const [activeAppTypes, setActiveAppTypes] = useState([]);
  const [selectedAppType, setSelectedAppType] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  
  // Activities by app type
  const [activitiesByType, setActivitiesByType] = useState({});
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load colleges to determine active app types
  useEffect(() => {
    if (!user) return;

    const collegesRef = collection(db, "users", user.uid, "colleges");
    const unsubColleges = onSnapshot(collegesRef, (snapshot) => {
      const appTypesSet = new Set();
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const appType = data.appType || data.activityTemplateType || 'other';
        appTypesSet.add(appType);
      });

      const types = Array.from(appTypesSet);
      setActiveAppTypes(types);
      
      if (types.length > 0 && !selectedAppType) {
        setSelectedAppType(types[0]);
        const template = getTemplateByAppType(types[0]);
        if (templateHasSections(template)) {
          setSelectedSection('activities');
        }
      }
    });

    return () => unsubColleges();
  }, [user, selectedAppType]);

  // Load activities for all app types
  useEffect(() => {
    if (!user || activeAppTypes.length === 0) return;

    const unsubscribers = [];

    activeAppTypes.forEach((appType) => {
      const activitiesRef = collection(
        db,
        "users",
        user.uid,
        "activityLists",
        appType,
        "activities"
      );
      
      const unsub = onSnapshot(activitiesRef, (snapshot) => {
        const activities = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setActivitiesByType((prev) => ({
          ...prev,
          [appType]: activities,
        }));
      });
      
      unsubscribers.push(unsub);
    });

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [user, activeAppTypes]);

  const currentTemplate = selectedAppType ? getTemplateByAppType(selectedAppType) : null;
  const hasSections = currentTemplate ? templateHasSections(currentTemplate) : false;
  
  const getCurrentActivities = () => {
    const allActivities = activitiesByType[selectedAppType] || [];
    
    if (hasSections && selectedSection) {
      return allActivities.filter(activity => activity.section === selectedSection);
    }
    
    return allActivities;
  };

  const currentActivities = getCurrentActivities();
  const currentFields = currentTemplate && hasSections && selectedSection
    ? getFieldsForSection(currentTemplate, selectedSection)
    : (currentTemplate?.fields || []);

  const handleOpenForm = (activity = null) => {
    if (activity) {
      setFormState(activity);
      setEditingId(activity.id);
    } else {
      const section = hasSections ? selectedSection : null;
      setFormState(initializeFormState(currentTemplate, section));
      setEditingId(null);
    }
    setIsFormOpen(true);
    setError("");
    setSuccess("");
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormState({});
    setEditingId(null);
    setError("");
  };

  const handleChange = (key, type) => (e) => {
    if (type === "checkboxes") {
      const value = e.target.value;
      const checked = e.target.checked;
      setFormState((prev) => {
        const arr = prev[key] || [];
        if (checked) {
          return { ...prev, [key]: [...arr, value] };
        } else {
          return { ...prev, [key]: arr.filter((v) => v !== value) };
        }
      });
    } else if (type === "radio") {
      setFormState((prev) => ({ ...prev, [key]: e.target.value }));
    } else {
      setFormState((prev) => ({ ...prev, [key]: e.target.value }));
    }
  };

  const validateForm = () => {
    for (const field of currentFields) {
      if (field.maxLength) {
        const value = formState[field.key] || '';
        if (value.length > field.maxLength) {
          setError(`${field.label} exceeds maximum length of ${field.maxLength} characters`);
          return false;
        }
      }
      
      if (field.required && field.type !== 'hidden') {
        const value = formState[field.key];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          setError(`${field.label} is required`);
          return false;
        }
      }
    }
    
    const maxItems = hasSections && selectedSection
      ? getMaxItemsForSection(currentTemplate, selectedSection)
      : (currentTemplate?.maxActivities || 10);
      
    if (!editingId && currentActivities.length >= maxItems) {
      const sectionLabel = hasSections && selectedSection
        ? currentTemplate.sections[selectedSection].label
        : 'activities';
      setError(`You can only add up to ${maxItems} ${sectionLabel.toLowerCase()} for ${currentTemplate.name}`);
      return false;
    }
    
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      const activityId = editingId || `activity_${Date.now()}`;
      const activityRef = doc(
        db,
        "users",
        user.uid,
        "activityLists",
        selectedAppType,
        "activities",
        activityId
      );

      await setDoc(activityRef, {
        ...formState,
        appType: selectedAppType,
        section: hasSections ? (formState.section || selectedSection) : undefined,
        updatedAt: new Date().toISOString(),
      });

      setSuccess(editingId ? "Item updated successfully!" : "Item added successfully!");
      handleCloseForm();
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save: " + err.message);
    }
  };

  const handleDelete = async (activityId) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const activityRef = doc(
        db,
        "users",
        user.uid,
        "activityLists",
        selectedAppType,
        "activities",
        activityId
      );
      
      await deleteDoc(activityRef);
      setSuccess("Item deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete: " + err.message);
    }
  };

  const shouldShowField = (field) => {
    if (field.type === 'hidden') return false;
    if (!field.showIf) return true;
    return field.showIf(formState);
  };

  const handleTabChange = (appType) => {
    setSelectedAppType(appType);
    const template = getTemplateByAppType(appType);
    if (templateHasSections(template)) {
      setSelectedSection('activities');
    } else {
      setSelectedSection(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-4xl font-black">Loading...</div>
      </div>
    );
  }

  if (activeAppTypes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black uppercase mb-8">
            📋 Activity Lists
          </h1>
          
          <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-8xl mb-6">📝</div>
            <h2 className="text-3xl font-black mb-4 uppercase">No Colleges Yet!</h2>
            <p className="text-xl font-bold mb-6">
              Add colleges to your list to start building your activity lists for each application type.
            </p>
            <Link href="/colleges">
              <button className="bg-yellow-300 border-4 border-black px-8 py-4 font-black text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all uppercase">
                ➕ Add Colleges
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-5xl md:text-6xl font-black uppercase mb-8">
          📋 Activity Lists & Awards
        </h1>
        
        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-400 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-bold text-lg">❌ {error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-400 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-bold text-lg">✅ {success}</p>
          </div>
        )}

        {/* Application Type Tabs */}
        <div className="flex flex-wrap gap-4 mb-6">
          {activeAppTypes.map((appType) => {
            const template = getTemplateByAppType(appType);
            const allActivitiesForType = activitiesByType[appType] || [];
            const count = allActivitiesForType.length;
            const maxTotal = template.maxActivities + (template.maxAwards || 0);
            
            return (
              <button
                key={appType}
                onClick={() => handleTabChange(appType)}
                className={`px-6 py-4 font-black text-xl border-4 border-black transition-all ${
                  selectedAppType === appType
                    ? 'bg-pink-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]'
                    : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>{template.name}</span>
                  <span className="bg-black text-white px-3 py-1 text-sm rounded-full">
                    {count}/{maxTotal}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Section Sub-Tabs (for Common App) */}
        {hasSections && currentTemplate.sections && (
          <div className="flex flex-wrap gap-3 mb-6 bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {Object.entries(currentTemplate.sections).map(([sectionKey, sectionData]) => {
              const sectionActivities = (activitiesByType[selectedAppType] || [])
                .filter(a => a.section === sectionKey);
              const sectionCount = sectionActivities.length;
              
              return (
                <button
                  key={sectionKey}
                  onClick={() => setSelectedSection(sectionKey)}
                  className={`px-4 py-2 font-bold text-lg border-2 border-black transition-all ${
                    selectedSection === sectionKey
                      ? 'bg-purple-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-gray-100 hover:bg-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {sectionData.label}
                  <span className="ml-2 text-sm">
                    ({sectionCount}/{sectionData.max})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Current Template Content */}
        {currentTemplate && (
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b-4 border-black">
              <div>
                <h2 className="text-3xl font-black uppercase mb-2">
                  {currentTemplate.name}
                  {hasSections && selectedSection && ` - ${currentTemplate.sections[selectedSection].label}`}
                </h2>
                <p className="text-lg font-semibold text-gray-700">
                  {hasSections && selectedSection
                    ? `${currentTemplate.sections[selectedSection].description}. You can add up to ${currentTemplate.sections[selectedSection].max} items. Currently added: ${currentActivities.length}`
                    : `You can add up to ${currentTemplate.maxActivities} activities/awards. Currently added: ${currentActivities.length}`
                  }
                </p>
              </div>
              <button
                onClick={() => handleOpenForm()}
                disabled={currentActivities.length >= (hasSections && selectedSection
                  ? getMaxItemsForSection(currentTemplate, selectedSection)
                  : currentTemplate.maxActivities)}
                className="bg-amber-300 border-4 border-black px-6 py-4 font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase whitespace-nowrap"
              >
                ➕ Add {hasSections && selectedSection
                  ? currentTemplate.sections[selectedSection].label.slice(0, -1)
                  : 'Item'}
              </button>
            </div>

            {/* Activities List */}
            {currentActivities.length === 0 ? (
              <div className="text-center py-12 bg-gray-100 border-2 border-black">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-xl font-bold mb-4">
                  No {hasSections && selectedSection
                    ? currentTemplate.sections[selectedSection].label.toLowerCase()
                    : 'activities'} added yet for {currentTemplate.name}.
                </p>
                <p className="text-gray-600">Click "Add" to get started!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {currentActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="bg-gradient-to-r from-yellow-100 to-pink-100 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-black text-white px-4 py-2 font-black text-xl rounded">
                        #{index + 1}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenForm(activity)}
                          className="bg-blue-400 border-2 border-black px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(activity.id)}
                          className="bg-red-400 border-2 border-black px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-black mb-2">{activity.activityName || activity.awardName}</h3>
                    
                    {activity.role && (
                      <p className="text-lg font-bold text-purple-700 italic mb-2">{activity.role}</p>
                    )}
                    
                    {(activity.activityCategory || activity.awardCategory || activity.category) && (
                      <div className="inline-block bg-yellow-300 border-2 border-black px-3 py-1 font-bold text-sm mb-3">
                        {activity.activityCategory || activity.awardCategory || activity.category}
                      </div>
                    )}
                    
                    <p className="text-base leading-relaxed mb-4 font-mono bg-white border-2 border-black p-3">
                      {activity.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm font-bold">
                      {activity.gradesParticipated && (
                        <div className="bg-white border-2 border-black px-3 py-1">
                          📚 Grades: {Array.isArray(activity.gradesParticipated) ? activity.gradesParticipated.join(', ') : activity.gradesParticipated}
                        </div>
                      )}
                      {activity.gradeReceived && (
                        <div className="bg-white border-2 border-black px-3 py-1">
                          🏆 Grade: {Array.isArray(activity.gradeReceived) ? activity.gradeReceived.join(', ') : activity.gradeReceived}
                        </div>
                      )}
                      {activity.recognitionLevel && (
                        <div className="bg-white border-2 border-black px-3 py-1">
                          🌟 Level: {activity.recognitionLevel}
                        </div>
                      )}
                      {activity.hoursPerWeek && activity.weeksPerYear && (
                        <div className="bg-white border-2 border-black px-3 py-1">
                          ⏰ {activity.hoursPerWeek} hrs/week • {activity.weeksPerYear} weeks/year
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form Modal */}
        {isFormOpen && (
          <ActivityModal
            formState={formState}
            currentFields={currentFields}
            currentTemplate={currentTemplate}
            selectedSection={selectedSection}
            editingId={editingId}
            onClose={handleCloseForm}
            onSave={handleSave}
            onChange={handleChange}
            shouldShowField={shouldShowField}
            getCharacterCount={getCharacterCount}
            getCategoriesForSection={getCategoriesForSection}
          />
        )}
      </div>
    </div>
  );
}

// Activity Modal Component
function ActivityModal({
  formState,
  currentFields,
  currentTemplate,
  selectedSection,
  editingId,
  onClose,
  onSave,
  onChange,
  shouldShowField,
  getCharacterCount,
  getCategoriesForSection
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white border-4 border-black w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="sticky top-0 bg-amber-300 border-b-4 border-black p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black uppercase">
              {editingId ? '✏️ Edit' : '➕ Add'}{' '}
              {selectedSection && currentTemplate.sections
                ? currentTemplate.sections[selectedSection].label.slice(0, -1)
                : 'Item'}{' '}
              - {currentTemplate.name}
            </h2>
            <button
              onClick={onClose}
              className="bg-rose-400 border-2 border-black px-4 py-2 font-bold text-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={onSave} className="p-6 space-y-6">
          {currentFields.map((field) => {
            if (!shouldShowField(field)) return null;

            return (
              <div key={field.key}>
                <label className="block text-xl font-black mb-2 uppercase">
                  {field.label}
                  {field.required && <span className="text-red-600 ml-1">*</span>}
                </label>
                
                {field.helpText && (
                  <p className="text-sm font-semibold text-gray-600 mb-3 italic">
                    💡 {field.helpText}
                  </p>
                )}

                {/* Text Input */}
                {field.type === 'text' && (
                  <div>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-amber-300"
                      value={formState[field.key] || ''}
                      onChange={onChange(field.key, field.type)}
                      maxLength={field.maxLength}
                      required={field.required}
                    />
                    {field.maxLength && (
                      <div className="text-right text-sm font-bold mt-1">
                        {getCharacterCount(formState[field.key], field.maxLength)}
                      </div>
                    )}
                  </div>
                )}

                {/* Textarea */}
                {field.type === 'textarea' && (
                  <div>
                    <textarea
                      className="w-full px-4 py-3 border-4 border-black font-mono text-base focus:outline-none focus:ring-4 focus:ring-amber-300 min-h-[120px]"
                      value={formState[field.key] || ''}
                      onChange={onChange(field.key, field.type)}
                      maxLength={field.maxLength}
                      required={field.required}
                      rows={4}
                    />
                    {field.maxLength && (
                      <div className="text-right text-sm font-bold mt-1">
                        {getCharacterCount(formState[field.key], field.maxLength)}
                      </div>
                    )}
                  </div>
                )}

                {/* Number Input */}
                {field.type === 'number' && (
                  <input
                    type="number"
                    className="w-full px-4 py-3 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-amber-300"
                    value={formState[field.key] || ''}
                    onChange={onChange(field.key, field.type)}
                    min={field.min}
                    max={field.max}
                    required={field.required}
                  />
                )}

                {/* Dropdown */}
                {field.type === 'dropdown' && (
                  <select
                    className="w-full px-4 py-3 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-amber-300"
                    value={formState[field.key] || ''}
                    onChange={onChange(field.key, field.type)}
                    required={field.required}
                  >
                    <option value="">-- Select --</option>
                    {(field.options || getCategoriesForSection(currentTemplate, selectedSection)).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {/* Checkboxes */}
                {field.type === 'checkboxes' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {field.options.map((option) => (
                      <label key={option} className="flex items-center gap-2 bg-white border-2 border-black p-3 cursor-pointer hover:bg-amber-100 transition-colors">
                        <input
                          type="checkbox"
                          value={option}
                          checked={(formState[field.key] || []).includes(option)}
                          onChange={onChange(field.key, field.type)}
                          className="w-5 h-5"
                        />
                        <span className="font-bold">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Radio */}
                {field.type === 'radio' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {field.options.map((option) => (
                      <label key={option} className="flex items-center gap-2 bg-white border-2 border-black p-3 cursor-pointer hover:bg-yellow-100 transition-colors">
                        <input
                          type="radio"
                          name={field.key}
                          value={option}
                          checked={formState[field.key] === option}
                          onChange={onChange(field.key, field.type)}
                          required={field.required}
                          className="w-5 h-5"
                        />
                        <span className="font-bold">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex gap-4 pt-6 border-t-4 border-black">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-rose-400 border-4 border-black px-6 py-4 font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-amber-300 border-4 border-black px-6 py-4 font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all uppercase"
            >
              💾 {editingId ? 'Update' : 'Add'}{' '}
              {selectedSection && currentTemplate.sections
                ? currentTemplate.sections[selectedSection].label.slice(0, -1)
                : 'Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}