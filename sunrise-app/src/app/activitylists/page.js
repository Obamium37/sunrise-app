"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { auth, db } from "../../lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

// Define template fields for each type
const activityTemplates = {
  commonApp: [
    { key: "activityName", label: "Name of activity (or award)", type: "text" },
    { key: "role", label: "Role / Leadership / Position", type: "text" },
    {
      key: "gradesParticipated",
      label: "Grades participated",
      type: "checkboxes",
      options: ["9", "10", "11", "12", "Post‑graduate"],
    },
    {
      key: "timing",
      label: "Timing of participation",
      type: "checkboxes",
      options: ["During school year", "During school break", "All year"],
    },
    { key: "hoursPerWeek", label: "Hours per week", type: "number" },
    { key: "weeksPerYear", label: "Weeks per year", type: "number" },
    { key: "description", label: "Description (what you did, recognition, impacts)", type: "textarea" },
    {
      key: "intendSimilarInCollege",
      label: "Intend to participate in similar activity in college?",
      type: "radio",
      options: ["Yes", "No"],
    },
  ],
  uc: [
    // Could have a different set or reuse mostly, adapt as needed
    { key: "activityName", label: "Name of activity (or award)", type: "text" },
    { key: "role", label: "Role / Position", type: "text" },
    {
      key: "gradesParticipated",
      label: "Grades participated",
      type: "checkboxes",
      options: ["9", "10", "11", "12", "Post‑graduate"],
    },
    { key: "hoursPerWeek", label: "Hours per week", type: "number" },
    { key: "weeksPerYear", label: "Weeks per year", type: "number" },
    { key: "description", label: "Describe your role / accomplishments", type: "textarea" },
  ],
  mit: [
    { key: "activityName", label: "Name of activity (or award)", type: "text" },
    { key: "impact", label: "Impact / What you achieved", type: "textarea" },
    { key: "duration", label: "Duration (e.g. years / months)", type: "text" },
    // you can expand with hours/weeks etc.
  ],
};

export default function ActivityListsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [template, setTemplate] = useState("");
  const [formState, setFormState] = useState({});
  const [savedEntries, setSavedEntries] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    // Load saved entries for each template
    const q = query(
      collection(db, "users", user.uid, "activityLists"),
      where("template", "==", template)
    );
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((doc) => doc.data());
      setSavedEntries(arr);
    });
    return () => unsub();
  }, [user, router, template]);

  const handleTemplateChange = (e) => {
    const t = e.target.value;
    setTemplate(t);
    if (t) {
      const init = {};
      activityTemplates[t].forEach((field) => {
        // for checkboxes, default to empty array
        if (field.type === "checkboxes") init[field.key] = [];
        else init[field.key] = "";
      });
      setFormState(init);
    }
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!template) {
      setError("Please pick an activity type (template).");
      return;
    }
    setError("");
    try {
      const userALDoc = doc(db, "users", user.uid, "activityLists", template);
      await setDoc(userALDoc, {
        template,
        entries: [formState],
      });
      // Optionally clear form
      const clean = {};
      activityTemplates[template].forEach((f) => {
        clean[f.key] = f.type === "checkboxes" ? [] : "";
      });
      setFormState(clean);
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "auto" }}>
      <h2>Activity Lists</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="templateSelect">Select activity type: </label>
        <select
          id="templateSelect"
          value={template}
          onChange={handleTemplateChange}
        >
          <option value="">-- choose --</option>
          <option value="commonApp">Common App</option>
          <option value="uc">UC</option>
          <option value="mit">MIT</option>
        </select>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {template && (
        <form onSubmit={handleSave}>
          {activityTemplates[template].map((field) => (
            <div key={field.key} style={{ marginBottom: "1rem" }}>
              <label htmlFor={field.key}>{field.label}:</label>
              <br />
              {field.type === "text" && (
                <input
                  id={field.key}
                  type="text"
                  value={formState[field.key] || ""}
                  onChange={handleChange(field.key, field.type)}
                  required
                  style={{ width: "100%", padding: "0.4rem" }}
                />
              )}
              {field.type === "number" && (
                <input
                  id={field.key}
                  type="number"
                  value={formState[field.key] || ""}
                  onChange={handleChange(field.key, field.type)}
                  required
                  style={{ width: "100%", padding: "0.4rem" }}
                />
              )}
              {field.type === "textarea" && (
                <textarea
                  id={field.key}
                  value={formState[field.key] || ""}
                  onChange={handleChange(field.key, field.type)}
                  required
                  style={{ width: "100%", padding: "0.4rem", minHeight: "100px" }}
                />
              )}
              {field.type === "checkboxes" && (
                <div>
                  {field.options.map((opt) => (
                    <label key={opt} style={{ marginRight: "1rem" }}>
                      <input
                        type="checkbox"
                        value={opt}
                        checked={
                          (formState[field.key] || []).includes(opt)
                        }
                        onChange={handleChange(field.key, field.type)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
              {field.type === "radio" && (
                <div>
                  {field.options.map((opt) => (
                    <label key={opt} style={{ marginRight: "1rem" }}>
                      <input
                        type="radio"
                        name={field.key}
                        value={opt}
                        checked={formState[field.key] === opt}
                        onChange={handleChange(field.key, field.type)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button type="submit">Save Activity</button>
        </form>
      )}

      <div style={{ marginTop: "2rem" }}>
        <h3>Saved Activities</h3>
        {savedEntries.length === 0 && <p>No activities yet.</p>}
        <ul>
          {savedEntries.map((entry, idx) => (
            <li key={idx} style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "0.5rem" }}>
              {Object.entries(entry).map(([k, v]) => {
                if (Array.isArray(v)) {
                  return `${k}: ${v.join(", ")} `;
                }
                return `${k}: ${v} `;
              }).join(" | ")}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
