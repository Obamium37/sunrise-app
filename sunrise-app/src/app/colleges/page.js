"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, onSnapshot, addDoc } from "firebase/firestore";
import { encryptData, decryptData } from "../../lib/crypto";
import Link from "next/link";
import { isCommonAppCollege } from "../../lib/collegeClassification"; // from earlier
import SidebarLayout from "../../components/SidebarLayout";
import styles from "./colleges.module.css";

export default function CollegesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [colleges, setColleges] = useState([]);
  const [newCollegeName, setNewCollegeName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    const q = query(collection(db, "users", user.uid, "colleges"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setColleges(arr);
    });
    return () => unsub();
  }, [user, router]);

  const handleAddCollege = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!newCollegeName || !deadline) {
      setErrorMsg("College name and deadline are required.");
      return;
    }

    try {
      const encName = await encryptData(user.uid, newCollegeName);
      const encDeadline = await encryptData(user.uid, deadline);

      const appType = isCommonAppCollege(newCollegeName) ? "commonApp" : "other";

      await addDoc(collection(db, "users", user.uid, "colleges"), {
        encryptedCollegeName: encName,
        encryptedDeadline: encDeadline,
        appType,
        activityTemplateType: appType,
      });

      setNewCollegeName("");
      setDeadline("");
    } catch (err) {
      console.error("Add college error:", err);
      setErrorMsg("Failed to add college: " + err.message);
    }
  };

  return (
    <div className={styles['container']}>
      <SidebarLayout></SidebarLayout>

      <div className={styles['content']}>
        <h2>Your Colleges</h2>
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

        <form className={styles['form']} onSubmit={handleAddCollege}>
          <h4 className={styles['form-input-header']}>College Name</h4>
          <input
            className={styles['form-input']}
            placeholder="College Name"
            value={newCollegeName}
            onChange={(e) => setNewCollegeName(e.target.value)}
            required
          />
          <h4 className={styles['form-input-header']}>Application Deadline</h4>
          <input
            className={styles['form-input']}
            type="date"
            placeholder="Application Deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
          <button className={styles['submit-button']} type="submit">Add College</button>
        </form>

        <ul>
          {colleges.map((c) => (
            <li key={c.id} style={{ marginBottom: "0.75rem" }}>
              <Link href={`/colleges/${c.id}`}>
                <DecryptCollegeName userId={user.uid} encrypted={c.data.encryptedCollegeName} />
              </Link>{" "}
              — {c.data.appType}
            </li>
          ))}
          {colleges.length === 0 && <p>No colleges added yet.</p>}
        </ul>
      </div>
    </div>
  );
}

function DecryptCollegeName({ userId, encrypted }) {
  const [name, setName] = useState("");
  useEffect(() => {
    decryptData(userId, encrypted)
      .then((dec) => setName(dec || "Unknown"))
      .catch((err) => {
        console.error("Decrypt college name error:", err);
        setName("Unknown");
      });
  }, [userId, encrypted]);
  return <>{name}</>;
}
