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
import styles from './account.module.css';
import SidebarLayout from "@/components/SidebarLayout";

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

        setName(data.name || "");
        setCity(data.city || "");
        setGpa(data.gpa || "");
        setGpaScale(data.gpaScale || "4");
        setWeighted(data.weighted === "true" || data.weighted === true);
        setTestType(data.testType || "SAT");
        setTestScore(data.testScore || "");
        setLocation(data.location || "PNW");
        setCostPref(data.costPref || "public");
        setMajorPrestige(data.majorPrestige || "3");
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
        name: name,
        city: city,
        gpa: gpa,
        gpaScale: gpaScale,
        weighted: weighted.toString(),
        testType: testType,
        testScore: testScore,
        location: location,
        costPref: costPref,
        majorPrestige: majorPrestige,
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
    <div className={styles['container']}>
      <SidebarLayout></SidebarLayout>
      <div className={styles['content']}>
        <h2>Edit Account Details</h2>
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}

        <form onSubmit={handleUpdateInfo}>
          <div className={styles['column-container']}>
            <div className={styles['column']}>
              <label className={styles['label']}>Full Name</label>
              <input
                className={styles['typed-input']}
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label className={styles['label']}>City</label>
              <input
                className={styles['typed-input']}
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />

              <label className={styles['label']}><br />GPA</label>
              <input
                className={styles['typed-input']}
                placeholder="GPA"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                required
              />

              <label className={styles['label']}><br />GPA Scale</label>
              <select className={styles['dropdown-input']} value={gpaScale} onChange={(e) => setGpaScale(e.target.value)}>
                <option value="4">4.0</option>
                <option value="5">5.0</option>
                <option value="6">6.0</option>
                <option value="100">100</option>
              </select>

              <div style={{display: 'flex'}}>
                <input
                    className={styles['checked-input']}
                    type="checkbox"
                    checked={weighted}
                    onChange={(e) => setWeighted(e.target.checked)}
                  />
                <label className={styles['label']}>Weighted GPA?</label>
              </div>
            </div>
            
            <div className={styles['column']}>
              <label className={styles['label']}><br />Test Type</label>
              <select className={styles['dropdown-input']} value={testType} onChange={(e) => setTestType(e.target.value)}>
                <option value="SAT">SAT</option>
                <option value="ACT">ACT</option>
              </select>

              <label className={styles['label']}>Test Score</label>
              <input
                className={styles['typed-input']}
                placeholder="Test Score"
                value={testScore}
                onChange={(e) => setTestScore(e.target.value)}
                required
              />

              <label className={styles['label']}><br /><br />Location Preference</label>
              <select className={styles['dropdown-input']} value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="PNW">PNW</option>
                <option value="West">West</option>
                <option value="East">East</option>
                <option value="Midwest">Midwest</option>
                <option value="South">South</option>
              </select>

              <label className={styles['label']}><br />Cost Preference</label>
              <select className={styles['dropdown-input']} value={costPref} onChange={(e) => setCostPref(e.target.value)}>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>

              <div style={{display: 'flex',}}>
                <label className={styles['label']}><br />Major Prestige Importance</label>
              
                <input
                  className={styles['input']}
                  type="range"
                  min="1"
                  max="5"
                  value={majorPrestige}
                  onChange={(e) => setMajorPrestige(e.target.value)}
                />
                <span className={styles['prestige']}>{majorPrestige}/5</span>
              </div>
            </div>
          </div>

          <button className={styles['submit-button']} type="submit" style={{ marginTop: "1rem" }}>
              Update
          </button>
        </form>

        <hr />

        <h3 className={styles['header']}>Change Password</h3>
        <input
          className={styles['typed-input']}
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button onClick={handlePasswordChange}>Update Password</button>

        <hr />

        <h3 className={styles['header']}>❌ Delete Account</h3>
        <button onClick={handleDeleteAccount} style={{ color: "red" }}>
          Delete My Account
        </button>

        <hr />

        <Link href="/home" style={{ display: "block", marginTop: "2rem" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}