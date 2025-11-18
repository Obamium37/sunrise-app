import { useState, useMemo, useRef, useEffect } from "react";
import styles from "./NewCollegeModal.module.css";
import { searchColleges } from "../lib/collegeLoader";

const NewCollegeModal = ({ setIsOpen, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [deadlineType, setDeadlineType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Filter colleges based on search term
  const filteredColleges = useMemo(() => {
    return searchColleges(searchTerm);
  }, [searchTerm]);

  // Get available deadline types for selected college
  const availableDeadlines = useMemo(() => {
    if (!selectedCollege) return [];
    
    const deadlines = selectedCollege.application_info.deadlines;
    return Object.entries(deadlines)
      .filter(([key, value]) => value !== null && value !== false)
      .map(([key, value]) => ({ type: key, date: value }));
  }, [selectedCollege]);

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
    }
  };

  const handleCollegeSelect = (college) => {
    setSelectedCollege(college);
    setSearchTerm(college.university);
    setShowDropdown(false);
    setDeadlineType(""); // Reset deadline when college changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedCollege || !deadlineType) {
      setIsSubmitting(false);
      return;
    }

    // Format the deadline type for display
    const formattedDeadlineType = deadlineType
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();

    const deadline = selectedCollege.application_info.deadlines[deadlineType];

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
                  onChange={(e) => setDeadlineType(e.target.value)}
                  required
                >
                  <option value="">-- Select Deadline Type --</option>
                  {availableDeadlines.map(({ type, date }) => (
                    <option key={type} value={type}>
                      {type
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())
                        .trim()}{" "}
                      {date === true ? "(Rolling)" : `- ${date}`}
                    </option>
                  ))}
                </select>
              </>
            )}

            {selectedCollege && availableDeadlines.length === 0 && (
              <p style={{ color: "red", fontSize: "0.9rem", marginTop: "1rem" }}>
                No deadline information available for this college.
              </p>
            )}
          </div>

          <div className={styles["submit-button-container"]}>
            <button
              className={styles["submit-button"]}
              type="submit"
              disabled={isSubmitting || !selectedCollege || !deadlineType}
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