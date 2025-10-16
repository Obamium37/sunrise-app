"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { encryptData } from "../../lib/crypto";

export default function Onboarding() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [gpa, setGpa] = useState("");
  const [gpaScale, setGpaScale] = useState("4");
  const [isWeighted, setIsWeighted] = useState(false);
  const [testType, setTestType] = useState("SAT");
  const [testScore, setTestScore] = useState("");
  const [location, setLocation] = useState("PNW");
  const [costPref, setCostPref] = useState("public");
  const [majorPrestige, setMajorPrestige] = useState("3");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const user = auth.currentUser;
    if (!user) {
      setErrorMsg("User not logged in.");
      return;
    }

    if (!name || !city || !gpa || !testScore) {
      setErrorMsg("Please fill all required fields.");
      return;
    }

    try {
      const encryptedFields = {
        encryptedName: await encryptData(user.uid, name),
        encryptedCity: await encryptData(user.uid, city),
        encryptedGPA: await encryptData(user.uid, gpa),
        encryptedGpaScale: await encryptData(user.uid, gpaScale),
        encryptedWeighted: await encryptData(user.uid, isWeighted),
        encryptedTestType: await encryptData(user.uid, testType),
        encryptedTestScore: await encryptData(user.uid, testScore),
        encryptedLocation: await encryptData(user.uid, location),
        encryptedCostPref: await encryptData(user.uid, costPref),
        encryptedMajorPrestige: await encryptData(user.uid, majorPrestige),
      };

      await setDoc(doc(db, "users", user.uid), encryptedFields);

      setSuccessMsg("Onboarding complete!");
      router.push("/home");
    } catch (err) {
      console.error(err);
      setErrorMsg("Error saving data: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", paddingTop: "2rem" }}>
      <h2>Welcome! Let’s get to know you 👋</h2>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}

      <form onSubmit={handleSubmit}>

        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />

        <input
          placeholder="GPA"
          value={gpa}
          onChange={(e) => setGpa(e.target.value)}
          required
        />

        <label htmlFor="gpaScale">GPA Scale:</label>
        <select id="gpaScale" value={gpaScale} onChange={(e) => setGpaScale(e.target.value)}>
          <option value="4">4.0</option>
          <option value="5">5.0</option>
          <option value="6">6.0</option>
          <option value="100">100</option>
        </select>

        <label>
          Weighted GPA?
          <input
            type="checkbox"
            checked={isWeighted}
            onChange={(e) => setIsWeighted(e.target.checked)}
          />
        </label>

        <label>Test Type:</label>
        <label>
          <input
            type="radio"
            name="testType"
            value="SAT"
            checked={testType === "SAT"}
            onChange={(e) => setTestType(e.target.value)}
          />
          SAT
        </label>
        <label>
          <input
            type="radio"
            name="testType"
            value="ACT"
            checked={testType === "ACT"}
            onChange={(e) => setTestType(e.target.value)}
          />
          ACT
        </label>

        <input
          placeholder="Score"
          value={testScore}
          onChange={(e) => setTestScore(e.target.value)}
          required
        />

        <label htmlFor="location">Location Preference:</label>
        <select id="location" value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="PNW">PNW</option>
          <option value="West">West</option>
          <option value="East">East</option>
          <option value="Midwest">Midwest</option>
          <option value="South">South</option>
        </select>

        <label>Cost Preference:</label>
        <label>
          <input
            type="radio"
            name="costPref"
            value="public"
            checked={costPref === "public"}
            onChange={(e) => setCostPref(e.target.value)}
          />
          Public
        </label>
        <label>
          <input
            type="radio"
            name="costPref"
            value="private"
            checked={costPref === "private"}
            onChange={(e) => setCostPref(e.target.value)}
          />
          Private
        </label>

        <label htmlFor="majorPrestige">
          Importance of Prestige for Major:
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={majorPrestige}
          onChange={(e) => setMajorPrestige(e.target.value)}
        />
        <span>{majorPrestige}/5</span>

        <br /><br />
        <button type="submit">Finish</button>
      </form>
    </div>
  );
}
