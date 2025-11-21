import { useState, useMemo, useRef, useEffect } from "react";
import { searchColleges } from "../lib/collegeLoader";

const NewCollegeModal = ({ setIsOpen, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [deadlineType, setDeadlineType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [dateError, setDateError] = useState("");
  const dropdownRef = useRef(null);

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString().split('T')[0];
  }, []);

  // Filter colleges based on search term
  const filteredColleges = useMemo(() => {
    return searchColleges(searchTerm);
  }, [searchTerm]);

  // Get available deadline types for selected college
  const availableDeadlines = useMemo(() => {
    if (!selectedCollege) return [];
    
    const deadlines = selectedCollege.application_info.deadlines;
    
    // Filter out past deadlines and format them
    return Object.entries(deadlines)
      .filter(([key, value]) => {
        if (value === null || value === false) return false;
        if (value === true) return true; // Rolling admissions - always include
        
        // Check if deadline is in the future
        const deadlineDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return deadlineDate >= today;
      })
      .map(([key, value]) => ({ type: key, date: value }));
  }, [selectedCollege]);

  // Validate deadline date
  const validateDeadline = (dateString) => {
    // Rolling admissions is always valid
    if (!dateString || dateString === "Rolling" || dateString === true) {
      setDateError("");
      return true;
    }
    
    const selectedDate = new Date(dateString);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < todayDate) {
      setDateError("⚠️ Deadline cannot be in the past");
      return false;
    }
    
    setDateError("");
    return true;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
    if (!e.target.value) {
      setSelectedCollege(null);
      setDateError("");
    }
  };

  const handleCollegeSelect = (college) => {
    setSelectedCollege(college);
    setSearchTerm(college.university);
    setShowDropdown(false);
    setDeadlineType(""); // Reset deadline when college changes
    setDateError("");
  };

  const handleDeadlineTypeChange = (e) => {
    const type = e.target.value;
    setDeadlineType(type);
    
    if (type && selectedCollege) {
      const deadline = selectedCollege.application_info.deadlines[type];
      validateDeadline(deadline);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setDateError("");

    if (!selectedCollege || !deadlineType) {
      setDateError("Please select a college and deadline type");
      setIsSubmitting(false);
      return;
    }

    // Format the deadline type for display
    const formattedDeadlineType = deadlineType
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();

    const deadline = selectedCollege.application_info.deadlines[deadlineType];

    // Final validation before submitting (handles rolling admissions)
    if (!validateDeadline(deadline)) {
      setIsSubmitting(false);
      return;
    }

    const collegeData = {
      name: selectedCollege.university,
      appType: selectedCollege.application_info.app_type,
      deadline: deadline === true ? "Rolling" : deadline,
      deadlineType: formattedDeadlineType,
      collegeId: selectedCollege.id,
    };

    const success = await onSubmit(collegeData);
    setIsSubmitting(false);

    if (success) {
      setIsOpen(false);
    }
  };

  // Show warning for deadlines
  const getDeadlineWarning = (deadline) => {
    // Rolling admissions has no warning
    if (!deadline || deadline === true) return null;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) {
      return { text: "⚠️ This deadline has passed", color: "red" };
    } else if (daysUntil <= 7) {
      return { text: `⚠️ Due in ${daysUntil} days!`, color: "orange" };
    } else if (daysUntil <= 30) {
      return { text: `Due in ${daysUntil} days`, color: "blue" };
    }
    
    return null;
  };

  const formatAppType = (appType) => {
    const appTypeMap = {
      'commonApp': 'Common App',
      'uc': 'UC Application',
      'mit': 'MIT',
      'coalitionApp': 'Coalition App',
    };
    return appTypeMap[appType] || appType;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60" 
        onClick={() => setIsOpen(false)} 
      />
      
      {/* Modal */}
      <div className="relative bg-white border-4 border-black w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-300 to-pink-300 border-b-4 border-black p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-black uppercase">
              🎓 Add a College
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-red-400 border-2 border-black px-4 py-2 font-bold text-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Search College Section */}
          <div className="bg-blue-100 border-4 border-black p-4">
            <label className="block text-xl font-black mb-3 uppercase">
              🔍 Search College
            </label>
            
            <div className="relative" ref={dropdownRef}>
              <input
                type="text"
                placeholder="Type to search for a college..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(true)}
                autoComplete="off"
                className="w-full px-4 py-3 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-yellow-300"
              />
              
              {/* Dropdown Results */}
              {showDropdown && searchTerm && filteredColleges.length > 0 && (
                <ul className="absolute z-20 w-full mt-2 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-h-96 overflow-y-auto">
                  {filteredColleges.slice(0, 10).map((college) => (
                    <li
                      key={college.id}
                      onClick={() => handleCollegeSelect(college)}
                      className="p-4 cursor-pointer border-b-2 border-black last:border-b-0 hover:bg-yellow-100 transition-colors"
                    >
                      <div className="font-black text-lg">{college.university}</div>
                      <div className="font-bold text-sm text-gray-600">{college.location}</div>
                    </li>
                  ))}
                  {filteredColleges.length > 10 && (
                    <li className="p-4 text-center font-bold text-gray-500 bg-gray-100">
                      + {filteredColleges.length - 10} more results...
                    </li>
                  )}
                </ul>
              )}

              {/* No Results Message */}
              {showDropdown && searchTerm && filteredColleges.length === 0 && (
                <div className="absolute z-20 w-full mt-2 bg-red-100 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <p className="font-bold text-center">
                    ❌ No colleges found. Try a different search term.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* College Info (shown after selection) */}
          {selectedCollege && (
            <div className="bg-gradient-to-br from-purple-200 to-pink-200 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-2xl font-black mb-4 uppercase">📋 College Information</h3>
              
              <div className="space-y-3">
                <div className="bg-white border-2 border-black p-3">
                  <span className="font-black">🏫 Name: </span>
                  <span className="font-bold">{selectedCollege.university}</span>
                </div>
                
                <div className="bg-white border-2 border-black p-3">
                  <span className="font-black">📍 Location: </span>
                  <span className="font-bold">{selectedCollege.location}</span>
                </div>
                
                <div className="bg-white border-2 border-black p-3">
                  <span className="font-black">📝 Application Type: </span>
                  <span className="font-bold">{formatAppType(selectedCollege.application_info.app_type)}</span>
                </div>
                
                <div className="bg-white border-2 border-black p-3">
                  <span className="font-black">💰 Cost Type: </span>
                  <span className="font-bold capitalize">{selectedCollege.total_cost.type}</span>
                </div>
                
                <div className="bg-white border-2 border-black p-3">
                  <span className="font-black">📊 Average GPA: </span>
                  <span className="font-bold">
                    {selectedCollege.middle_50_percent.GPA_unweighted.low} - {selectedCollege.middle_50_percent.GPA_unweighted.high}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Deadline Selection */}
          {selectedCollege && availableDeadlines.length > 0 && (
            <div className="bg-green-100 border-4 border-black p-4">
              <label className="block text-xl font-black mb-3 uppercase">
                📅 Application Deadline Type
              </label>
              
              <select
                value={deadlineType}
                onChange={handleDeadlineTypeChange}
                required
                className="w-full px-4 py-3 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-yellow-300"
              >
                <option value="">-- Select Deadline Type --</option>
                {availableDeadlines.map(({ type, date }) => {
                  const warning = getDeadlineWarning(date);
                  const formattedType = type
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim();
                  
                  return (
                    <option key={type} value={type}>
                      {formattedType}{" "}
                      {date === true ? "(Rolling)" : `- ${date}`}
                      {warning ? ` ${warning.text}` : ""}
                    </option>
                  );
                })}
              </select>

              {/* Deadline Warning Display */}
              {deadlineType && selectedCollege && (
                (() => {
                  const deadline = selectedCollege.application_info.deadlines[deadlineType];
                  const warning = getDeadlineWarning(deadline);
                  
                  if (warning) {
                    return (
                      <div 
                        className={`mt-4 p-4 border-4 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                          warning.color === "red" ? "bg-red-300" :
                          warning.color === "orange" ? "bg-orange-300" :
                          "bg-blue-300"
                        }`}
                      >
                        {warning.text}
                      </div>
                    );
                  }
                  
                  // Show "Rolling Admission" message
                  if (deadline === true) {
                    return (
                      <div className="mt-4 p-4 border-4 border-black font-bold bg-green-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        ✅ Rolling Admission - No deadline!
                      </div>
                    );
                  }
                  
                  return null;
                })()
              )}
            </div>
          )}

          {/* No Future Deadlines Warning */}
          {selectedCollege && availableDeadlines.length === 0 && (
            <div className="bg-red-300 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-black text-lg text-center">
                ⚠️ No future deadlines available for this college. All deadlines have passed.
              </p>
            </div>
          )}

          {/* Error Message */}
          {dateError && (
            <div className="bg-red-400 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-bold text-lg">{dateError}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t-4 border-black">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-gray-300 border-4 border-black px-6 py-4 font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedCollege || !deadlineType || availableDeadlines.length === 0}
              className="flex-1 bg-green-400 border-4 border-black px-6 py-4 font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {isSubmitting ? "Adding..." : "➕ Add College"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCollegeModal;