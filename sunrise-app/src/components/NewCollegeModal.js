import { useState, useMemo, useRef, useEffect } from "react";
import styles from "./NewCollegeModal.module.css";
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
        if (value === true) return true; // Rolling admissions
        
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
    if (!dateString || dateString === "Rolling") return true;
    
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

    // Final validation before submitting
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

  return (
    <div>
      <div className={styles.darkBG} onClick={() => setIsOpen(false)} />
      <div className={styles.centered}>
        <div className={styles["close-button-container"]}>
          <button
            className={styles["close-button"]}
            onClick={() => setIsOpen(false)}
          >
            &#10005;
          </button>
        </div>
        <h2 className={styles["header"]}>Add a College</h2>
        <form className={styles["form"]} onSubmit={handleSubmit}>
          <div>
            {/* Searchable College Input with Dropdown */}
            <h4 className={styles["form-input-header"]}>Search College</h4>
            <div className={styles["autocomplete-container"]} ref={dropdownRef}>
              <input
                className={styles["form-input"]}
                type="text"
                placeholder="Type to search for a college..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(true)}
                autoComplete="off"
              />
              
              {/* Dropdown Results */}
              {showDropdown && searchTerm && filteredColleges.length > 0 && (
                <ul className={styles["dropdown-list"]}>
                  {filteredColleges.slice(0, 10).map((college) => (
                    <li
                      key={college.id}
                      className={styles["dropdown-item"]}
                      onClick={() => handleCollegeSelect(college)}
                    >
                      <div className={styles["college-name"]}>
                        {college.university}
                      </div>
                      <div className={styles["college-location"]}>
                        {college.location}
                      </div>
                    </li>
                  ))}
                  {filteredColleges.length > 10 && (
                    <li className={styles["dropdown-item-info"]}>
                      + {filteredColleges.length - 10} more results...
                    </li>
                  )}
                </ul>
              )}

              {/* No Results Message */}
              {showDropdown && searchTerm && filteredColleges.length === 0 && (
                <div className={styles["no-results"]}>
                  No colleges found. Try a different search term.
                </div>
              )}
            </div>

            {/* Show college info if selected */}
            {selectedCollege && (
              <div className={styles["college-info"]}>
                <p>
                  <strong>Location:</strong> {selectedCollege.location}
                </p>
                <p>
                  <strong>Application Type:</strong>{" "}
                  {selectedCollege.application_info.app_type === "commonApp"
                    ? "Common App"
                    : selectedCollege.application_info.app_type === "uc"
                    ? "UC Application"
                    : selectedCollege.application_info.app_type === "coalitionApp"
                    ? "Coalition App"
                    : "College-Specific Application"}
                </p>
                <p>
                  <strong>Cost Type:</strong>{" "}
                  {selectedCollege.total_cost.type === "public" ? "Public" : "Private"}
                </p>
                <p>
                  <strong>Average GPA:</strong>{" "}
                  {selectedCollege.middle_50_percent.GPA_unweighted.low} -{" "}
                  {selectedCollege.middle_50_percent.GPA_unweighted.high}
                </p>
              </div>
            )}

            {/* Deadline Type Dropdown */}
            {selectedCollege && availableDeadlines.length > 0 && (
              <>
                <h4 className={styles["form-input-header"]}>
                  Application Deadline Type
                </h4>
                <select
                  className={styles["form-input"]}
                  value={deadlineType}
                  onChange={handleDeadlineTypeChange}
                  required
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

                {/* Show deadline warning */}
                {deadlineType && selectedCollege && (
                  (() => {
                    const deadline = selectedCollege.application_info.deadlines[deadlineType];
                    const warning = getDeadlineWarning(deadline);
                    
                    if (warning) {
                      return (
                        <div 
                          style={{ 
                            marginTop: "0.5rem",
                            padding: "0.5rem",
                            backgroundColor: warning.color === "red" ? "#ffebee" : warning.color === "orange" ? "#fff3e0" : "#e3f2fd",
                            border: `2px solid ${warning.color === "red" ? "#f44336" : warning.color === "orange" ? "#ff9800" : "#2196f3"}`,
                            borderRadius: "4px",
                            color: warning.color === "red" ? "#c62828" : warning.color === "orange" ? "#e65100" : "#1565c0",
                            fontWeight: "bold",
                            fontSize: "0.9rem"
                          }}
                        >
                          {warning.text}
                        </div>
                      );
                    }
                    return null;
                  })()
                )}
              </>
            )}

            {selectedCollege && availableDeadlines.length === 0 && (
              <p style={{ color: "red", fontSize: "0.9rem", marginTop: "1rem" }}>
                ⚠️ No future deadlines available for this college. All deadlines have passed.
              </p>
            )}

            {/* Date Error Display */}
            {dateError && (
              <p style={{ 
                color: "red", 
                fontSize: "0.9rem", 
                marginTop: "1rem",
                padding: "0.5rem",
                backgroundColor: "#ffebee",
                border: "2px solid #f44336",
                borderRadius: "4px",
                fontWeight: "bold"
              }}>
                {dateError}
              </p>
            )}
          </div>

          <div className={styles["submit-button-container"]}>
            <button
              className={styles["submit-button"]}
              type="submit"
              disabled={isSubmitting || !selectedCollege || !deadlineType || availableDeadlines.length === 0}
            >
              {isSubmitting ? "Adding..." : "Add College"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCollegeModal;