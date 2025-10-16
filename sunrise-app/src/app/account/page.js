"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import { decryptData, encryptData } from "../../lib/crypto";

export default function Account() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [gpa, setGpa] = useState("");
  const [gpaScale, setGpaScale] = useState("4");
  const [weighted, setWeighted] = useState(false);
  const [testType, setTestType] = useState("SAT");
  const [testScore, setTestScore] = useState("");
  const [location, setLocation] = useState("PNW");
  const [costPref, setCostPref] = useState("public");
  const [majorPrestige, setMajorPrestige] = useState("3");
  const [newPassword, setNewPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          setErrorMsg("User data not found.");
          return;
        }
        const data = snap.data();

        // Decrypt all fields
        const decName = await decryptData(user.uid, data.encryptedName);
        const decCity = await decryptData(user.uid, data.encryptedCity);
        const decGpa = await decryptData(user.uid, data.encryptedGPA);
        const decGpaScale = await decryptData(user.uid, data.encryptedGpaScale);
        const decWeighted = await decryptData(user.uid, data.encryptedWeighted);
        const decTestType = await decryptData(user.uid, data.encryptedTestType);
        const decTestScore = await decryptData(user.uid, data.encryptedTestScore);
        const decLocation = await decryptData(user.uid, data.encryptedLocation);
        const decCostPref = await decryptData(user.uid, data.encryptedCostPref);
        const decMajorPrestige = await decryptData(user.uid, data.encryptedMajorPrestige);

        setName(decName || "");
        setCity(decCity || "");
        setGpa(decGpa || "");
        setGpaScale(decGpaScale || "4");
        setWeighted(decWeighted === "true" || decWeighted === true);
        setTestType(decTestType || "SAT");
        setTestScore(decTestScore || "");
        setLocation(decLocation || "PNW");
        setCostPref(decCostPref || "public");
        setMajorPrestige(decMajorPrestige || "3");
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load account data: " + err.message);
      }
    };

    fetchUserData();
  }, [user, router]);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const userRef = doc(db, "users", user.uid);
      const updates = {
        encryptedName: await encryptData(user.uid, name),
        encryptedCity: await encryptData(user.uid, city),
        encryptedGPA: await encryptData(user.uid, gpa),
        encryptedGpaScale: await encryptData(user.uid, gpaScale),
        encryptedWeighted: await encryptData(user.uid, weighted.toString()),
        encryptedTestType: await encryptData(user.uid, testType),
        encryptedTestScore: await encryptData(user.uid, testScore),
        encryptedLocation: await encryptData(user.uid, location),
        encryptedCostPref: await encryptData(user.uid, costPref),
        encryptedMajorPrestige: await encryptData(user.uid, majorPrestige),
      };
      await updateDoc(userRef, updates);
      setSuccessMsg("Account info updated successfully.");
    } catch (err) {
      console.error(err);
      setErrorMsg("Update failed: " + err.message);
    }
  };

  const handlePasswordChange = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const currentPassword = prompt("Enter your current password:");
      if (!currentPassword) {
        setErrorMsg("Password change cancelled.");
        return;
      }
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setSuccessMsg("Password updated successfully.");
      setNewPassword("");
    } catch (err) {
      setErrorMsg("Password update failed: " + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    const confirmDelete = confirm(
      "Are you sure you want to delete your account? This action is permanent."
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      router.push("/");
    } catch (err) {
      setErrorMsg("Account deletion failed: " + err.message);
    }
  };

  return (
    <div style={{ transform: 'scale(1.3)', maxWidth: "600px", margin: "auto", paddingTop: "4rem" }}>
      <h2>👤 Account Details</h2>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}

      <form onSubmit={handleUpdateInfo}>
        <h3>Edit Info</h3>

        <label>Full Name</label>
        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label><br />City</label>
        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />

        <label><br />GPA</label>
        <input
          placeholder="GPA"
          value={gpa}
          onChange={(e) => setGpa(e.target.value)}
          required
        />

        <label><br />GPA Scale</label>
        <select value={gpaScale} onChange={(e) => setGpaScale(e.target.value)}>
          <option value="4">4.0</option>
          <option value="5">5.0</option>
          <option value="6">6.0</option>
          <option value="100">100</option>
        </select>

        <label>
          Weighted GPA?
          <input
            type="checkbox"
            checked={weighted}
            onChange={(e) => setWeighted(e.target.checked)}
          />
        </label>

        <label><br />Test Type</label>
        <select value={testType} onChange={(e) => setTestType(e.target.value)}>
          <option value="SAT">SAT</option>
          <option value="ACT">ACT</option>
        </select>

        <label>Test Score</label>
        <input
          placeholder="Test Score"
          value={testScore}
          onChange={(e) => setTestScore(e.target.value)}
          required
        />

        <label><br /><br />Location Preference</label>
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="PNW">PNW</option>
          <option value="West">West</option>
          <option value="East">East</option>
          <option value="Midwest">Midwest</option>
          <option value="South">South</option>
        </select>

        <label><br />Cost Preference</label>
        <select value={costPref} onChange={(e) => setCostPref(e.target.value)}>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <label><br />Major Prestige Importance</label>
        <input
          type="range"
          min="1"
          max="5"
          value={majorPrestige}
          onChange={(e) => setMajorPrestige(e.target.value)}
        />
        <span>{majorPrestige}/5</span>

        <button type="submit" style={{ marginTop: "1rem" }}>
          Update Info
        </button>
      </form>

      <hr />

      <h3>🔒 Change Password</h3>
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handlePasswordChange}>Update Password</button>

      <hr />

      <h3>❌ Delete Account</h3>
      <button onClick={handleDeleteAccount} style={{ color: "red" }}>
        Delete My Account
      </button>

      <hr />

      <Link href="/home" style={{ display: "block", marginTop: "2rem" }}>
        ← Back to Home
      </Link>
    </div>
  );
}
