"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { db } from "../../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { encryptData, decryptData } from "../../../lib/crypto";

const activityTemplates = {
  commonApp: [
    { key: "activityName", label: "Activity / Award Title", type: "text" },
    { key: "role", label: "Role / Position", type: "text" },
    { key: "gradesParticipated", label: "Grades Participated", type: "checkboxes", options: ["9", "10", "11", "12", "Post"] },
    { key: "hoursPerWeek", label: "Hours per Week", type: "number" },
    { key: "weeksPerYear", label: "Weeks per Year", type: "number" },
    { key: "description", label: "Description / Impact", type: "textarea" },
  ],
  other: [
    { key: "activityName", label: "Activity Name", type: "text" },
    { key: "description", label: "Description / What you did", type: "textarea" },
    { key: "hours", label: "Hours", type: "number" },
  ],
};

export default function CollegeDetail({ params }) {
  const { collegeId } = params;
  const { user } = useAuth();
  const router = useRouter();

  const [collegeName, setCollegeName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [templateType, setTemplateType] = useState("other");
  const [formState, setFormState] = useState({});
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      const colDoc = await getDoc(
        doc(db, "users", user.uid, "colleges", collegeId)
      );
      if (!colDoc.exists()) {
        setErrorMsg("College not found.");
        return;
      }
      const colData = colDoc.data();

      const decName = await decryptData(user.uid, colData.encryptedCollegeName);
      const decDeadline = await decryptData(user.uid, colData.encryptedDeadline);

      setCollegeName(decName || "");
      setDeadline(decDeadline || "");

      const tt = colData.activityTemplateType || colData.appType || "other";
      setTemplateType(tt);

      // init formState
      const init = {};
      activityTemplates[tt].forEach((f) => {
        if (f.type === "checkboxes") init[f.key] = [];
        else init[f.key] = "";
      });
      setFormState(init);
    };

    fetchData();
  }, [user, collegeId, router]);

  const handleChange = (key, type) => (e) => {
    if (type === "checkboxes") {
      const arr = formState[key] || [];
      const val = e.target.value;
      if (e.target.checked) {
        setFormState({ ...formState, [key]: [...arr, val] });
      } else {
        setFormState({ ...formState, [key]: arr.filter((v) => v !== val) });
      }
    } else {
      setFormState({ ...formState, [key]: e.target.value });
    }
  };

  const handleSaveActivity = async (e) => {
    e.preventDefault();
    try {
      const activityRef = doc(
        db,
        "users",
        user.uid,
        "colleges",
        collegeId,
        "activityLists",
        "template"
      );
      const encryptedFields = {};
      for (const f of activityTemplates[templateType]) {
        const val = formState[f.key];
        encryptedFields[f.key] = await encryptData(user.uid, JSON.stringify(val));
      }
      await setDoc(activityRef, { encryptedFields });
    } catch (err) {
      console.error("Activity save error:", err);
      setErrorMsg("Could not save activity: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "2rem" }}>
      <h2>College: {collegeName}</h2>
      <p>Deadline: {deadline}</p>
      <hr />

      <h3>Activity Template: {templateType}</h3>
      <form onSubmit={handleSaveActivity}>
        {activityTemplates[templateType].map((f) => (
          <div key={f.key} style={{ marginBottom: "1rem" }}>
            <label>{f.label}</label><br />
            {f.type === "text" && (
              <input
                type="text"
                value={formState[f.key]}
                onChange={handleChange(f.key, f.type)}
                required
              />
            )}
            {f.type === "number" && (
              <input
                type="number"
                value={formState[f.key]}
                onChange={handleChange(f.key, f.type)}
                required
              />
            )}
            {f.type === "textarea" && (
              <textarea
                value={formState[f.key]}
                onChange={handleChange(f.key, f.type)}
                required
              />
            )}
            {f.type === "checkboxes" && (
              f.options.map((opt) => (
                <label key={opt} style={{ marginRight: "1rem" }}>
                  <input
                    type="checkbox"
                    value={opt}
                    checked={(formState[f.key] || []).includes(opt)}
                    onChange={handleChange(f.key, f.type)}
                  />
                  {opt}
                </label>
              ))
            )}
          </div>
        ))}
        <button type="submit">Save Activity</button>
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      </form>
    </div>
  );
}
