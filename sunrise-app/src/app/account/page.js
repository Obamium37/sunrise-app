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
  const [sat, setSat] = useState("");
  const [weighted, setWeighted] = useState(false);
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
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setGpa(data.gpa || "");
          setSat(data.sat || "");
          setWeighted(data.weighted || false);

          const decrypted = await decryptData(user.uid, data.encryptedStats);
          setName(decrypted.name);
          setCity(decrypted.city);
        } else {
          setErrorMsg("User data not found.");
        }
      } catch (err) {
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
      const encrypted = await encryptData(user.uid, { name, city });
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        gpa,
        sat,
        weighted,
        encryptedStats: encrypted,
      });

      setSuccessMsg("Account info updated successfully.");
    } catch (err) {
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
    <div>
      <h2>👤 Account Details</h2>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}

      <form onSubmit={handleUpdateInfo}>
        <h3>Edit Info</h3>
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
        <input
          placeholder="SAT"
          value={sat}
          onChange={(e) => setSat(e.target.value)}
          required
        />
        <label>
          Weighted GPA?
          <input
            type="checkbox"
            checked={weighted}
            onChange={(e) => setWeighted(e.target.checked)}
          />
        </label>
        <button type="submit">Update Info</button>
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
