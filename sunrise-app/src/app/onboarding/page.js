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
  const [sat, setSat] = useState("");
  const [isWeighted, setIsWeighted] = useState(false);
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

    // Validate fields minimally
    if (!name || !city || !gpa || !sat) {
      setErrorMsg("All fields are required.");
      return;
    }

    try {
      const sensitive = {
        name,
        city,
      };
      const encrypted = await encryptData(user.uid, sensitive);

      await setDoc(doc(db, "users", user.uid), {
        gpa,
        sat,
        weighted: isWeighted,
        encryptedStats: encrypted,
      });

      setSuccessMsg("Onboarding complete!");
      router.push("/home");
    } catch (err) {
      setErrorMsg("Error saving data: " + err.message);
    }
  };

  return (
    <div>
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
        <label>
          Weighted GPA?
          <input
            type="checkbox"
            checked={isWeighted}
            onChange={(e) => setIsWeighted(e.target.checked)}
          />
        </label>
        <input
          placeholder="SAT Score"
          value={sat}
          onChange={(e) => setSat(e.target.value)}
          required
        />
        <button type="submit">Finish</button>
      </form>
    </div>
  );
}
