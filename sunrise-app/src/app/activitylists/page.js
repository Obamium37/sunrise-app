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
import styles from "./activitylists.module.css";
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
  const [selectedSection, setSelectedSection] = useState(null); // For Common App: 'activities' or 'awards'
  
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
    if (!user) {
      return;
    }

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
      
      // Set initial selected type
      if (types.length > 0 && !selectedAppType) {
        setSelectedAppType(types[0]);
        const template = getTemplateByAppType(types[0]);
        if (templateHasSections(template)) {
          setSelectedSection('activities'); // Default to activities for Common App
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
  
  // Get current activities based on section (for Common App) or all (for others)
  const getCurrentActivities = () => {
    const allActivities = activitiesByType[selectedAppType] || [];
    
    if (hasSections && selectedSection) {
      // Filter by section for Common App
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
    // Check character limits
    for (const field of currentFields) {
      if (field.maxLength) {
        const value = formState[field.key] || '';
        if (value.length > field.maxLength) {
          setError(`${field.label} exceeds maximum length of ${field.maxLength} characters`);
          return false;
        }
      }
      
      // Check required fields
      if (field.required && field.type !== 'hidden') {
        const value = formState[field.key];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          setError(`${field.label} is required`);
          return false;
        }
      }
    }
    
    // Check activity limit
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

  // Handle tab selection (app type change)
  const handleTabChange = (appType) => {
    setSelectedAppType(appType);
    const template = getTemplateByAppType(appType);
    if (templateHasSections(template)) {
      setSelectedSection('activities'); // Reset to activities when changing app type
    } else {
      setSelectedSection(null);
    }
  };

  if (!user) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (activeAppTypes.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h2>Activity Lists</h2>
          <div className={styles.emptyState}>
            <p>You haven't added any colleges yet.</p>
            <p>Add colleges to your list to start building your activity lists for each application type.</p>
            <Link href="/colleges" className={styles.linkButton}>Go to Colleges</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2>Activity Lists & Awards</h2>
        
        {(error || success) && (
          <div className={styles.messageContainer}>
            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}
          </div>
        )}

        {/* Application Type Tabs */}
        <div className={styles.tabs}>
          {activeAppTypes.map((appType) => {
            const template = getTemplateByAppType(appType);
            const allActivitiesForType = activitiesByType[appType] || [];
            const count = allActivitiesForType.length;
            const maxTotal = template.maxActivities + (template.maxAwards || 0);
            
            return (
              <button
                key={appType}
                className={`${styles.tab} ${selectedAppType === appType ? styles.activeTab : ''}`}
                onClick={() => handleTabChange(appType)}
              >
                {template.name}
                <span className={styles.tabCount}>
                  {count}/{maxTotal}
                </span>
              </button>
            );
          })}
        </div>

        {/* Section Sub-Tabs (for Common App) */}
        {hasSections && currentTemplate.sections && (
          <div className={styles.subTabs}>
            {Object.entries(currentTemplate.sections).map(([sectionKey, sectionData]) => {
              const sectionActivities = (activitiesByType[selectedAppType] || [])
                .filter(a => a.section === sectionKey);
              const sectionCount = sectionActivities.length;
              
              return (
                <button
                  key={sectionKey}
                  className={`${styles.subTab} ${selectedSection === sectionKey ? styles.activeSubTab : ''}`}
                  onClick={() => setSelectedSection(sectionKey)}
                >
                  {sectionData.label}
                  <span className={styles.subTabCount}>
                    {sectionCount}/{sectionData.max}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Current Template Content */}
        {currentTemplate && (
          <div className={styles.templateContent}>
            <div className={styles.templateHeader}>
              <div>
                <h3>
                  {currentTemplate.name}
                  {hasSections && selectedSection && ` - ${currentTemplate.sections[selectedSection].label}`}
                </h3>
                <p className={styles.templateInfo}>
                  {hasSections && selectedSection
                    ? `${currentTemplate.sections[selectedSection].description}. You can add up to ${currentTemplate.sections[selectedSection].max} items. Currently added: ${currentActivities.length}`
                    : `You can add up to ${currentTemplate.maxActivities} activities/awards. Currently added: ${currentActivities.length}`
                  }
                </p>
              </div>
              <button
                className={styles.addButton}
                onClick={() => handleOpenForm()}
                disabled={currentActivities.length >= (hasSections && selectedSection
                  ? getMaxItemsForSection(currentTemplate, selectedSection)
                  : currentTemplate.maxActivities)}
              >
                + Add {hasSections && selectedSection
                  ? currentTemplate.sections[selectedSection].label.slice(0, -1) // Remove 's' from 'Activities' or 'Awards'
                  : 'Item'}
              </button>
            </div>

            {/* Activities List */}
            <div className={styles.activitiesList}>
              {currentActivities.length === 0 ? (
                <div className={styles.emptyActivities}>
                  <p>
                    No {hasSections && selectedSection
                      ? currentTemplate.sections[selectedSection].label.toLowerCase()
                      : 'activities'} added yet for {currentTemplate.name}.
                  </p>
                </div>
              ) : (
                currentActivities.map((activity, index) => (
                  <div key={activity.id} className={styles.activityCard}>
                    <div className={styles.activityHeader}>
                      <span className={styles.activityNumber}>#{index + 1}</span>
                      <div className={styles.activityActions}>
                        <button
                          className={styles.editButton}
                          onClick={() => handleOpenForm(activity)}
                        >
                          Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(activity.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className={styles.activityContent}>
                      <h4>{activity.activityName || activity.awardName}</h4>
                      {activity.role && <p className={styles.activityRole}>{activity.role}</p>}
                      {activity.activityCategory && (
                        <p className={styles.activityCategory}>{activity.activityCategory}</p>
                      )}
                      {activity.awardCategory && (
                        <p className={styles.activityCategory}>{activity.awardCategory}</p>
                      )}
                      {activity.category && (
                        <p className={styles.activityCategory}>{activity.category}</p>
                      )}
                      <p className={styles.activityDescription}>{activity.description}</p>
                      <div className={styles.activityMeta}>
                        {activity.gradesParticipated && (
                          <span>Grades: {Array.isArray(activity.gradesParticipated) ? activity.gradesParticipated.join(', ') : activity.gradesParticipated}</span>
                        )}
                        {activity.gradeReceived && (
                          <span>Grade: {Array.isArray(activity.gradeReceived) ? activity.gradeReceived.join(', ') : activity.gradeReceived}</span>
                        )}
                        {activity.recognitionLevel && (
                          <span>Level: {activity.recognitionLevel}</span>
                        )}
                        {activity.hoursPerWeek && activity.weeksPerYear && (
                          <span>{activity.hoursPerWeek} hrs/week • {activity.weeksPerYear} weeks/year</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Form Modal */}
        {isFormOpen && (
          <div className={styles.modal}>
            <div className={styles.modalOverlay} onClick={handleCloseForm} />
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>
                  {editingId ? 'Edit' : 'Add'}{' '}
                  {hasSections && selectedSection
                    ? currentTemplate.sections[selectedSection].label.slice(0, -1)
                    : 'Item'}{' '}
                  - {currentTemplate.name}
                </h3>
                <button className={styles.closeButton} onClick={handleCloseForm}>
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSave} className={styles.form}>
                {currentFields.map((field) => {
                  if (!shouldShowField(field)) return null;

                  return (
                    <div key={field.key} className={styles.formField}>
                      <label className={styles.fieldLabel}>
                        {field.label}
                        {field.required && <span className={styles.required}>*</span>}
                      </label>
                      
                      {field.helpText && (
                        <p className={styles.helpText}>{field.helpText}</p>
                      )}

                      {/* Text Input */}
                      {field.type === 'text' && (
                        <div>
                          <input
                            type="text"
                            className={styles.textInput}
                            value={formState[field.key] || ''}
                            onChange={handleChange(field.key, field.type)}
                            maxLength={field.maxLength}
                            required={field.required}
                          />
                          {field.maxLength && (
                            <span className={styles.charCount}>
                              {getCharacterCount(formState[field.key], field.maxLength)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Textarea */}
                      {field.type === 'textarea' && (
                        <div>
                          <textarea
                            className={styles.textarea}
                            value={formState[field.key] || ''}
                            onChange={handleChange(field.key, field.type)}
                            maxLength={field.maxLength}
                            required={field.required}
                            rows={4}
                          />
                          {field.maxLength && (
                            <span className={styles.charCount}>
                              {getCharacterCount(formState[field.key], field.maxLength)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Number Input */}
                      {field.type === 'number' && (
                        <input
                          type="number"
                          className={styles.numberInput}
                          value={formState[field.key] || ''}
                          onChange={handleChange(field.key, field.type)}
                          min={field.min}
                          max={field.max}
                          required={field.required}
                        />
                      )}

                      {/* Dropdown */}
                      {field.type === 'dropdown' && (
                        <select
                          className={styles.dropdown}
                          value={formState[field.key] || ''}
                          onChange={handleChange(field.key, field.type)}
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
                        <div className={styles.checkboxGroup}>
                          {field.options.map((option) => (
                            <label key={option} className={styles.checkboxLabel}>
                              <input
                                type="checkbox"
                                value={option}
                                checked={(formState[field.key] || []).includes(option)}
                                onChange={handleChange(field.key, field.type)}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Radio */}
                      {field.type === 'radio' && (
                        <div className={styles.radioGroup}>
                          {field.options.map((option) => (
                            <label key={option} className={styles.radioLabel}>
                              <input
                                type="radio"
                                name={field.key}
                                value={option}
                                checked={formState[field.key] === option}
                                onChange={handleChange(field.key, field.type)}
                                required={field.required}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelButton} onClick={handleCloseForm}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveButton}>
                    {editingId ? 'Update' : 'Add'}{' '}
                    {hasSections && selectedSection
                      ? currentTemplate.sections[selectedSection].label.slice(0, -1)
                      : 'Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}