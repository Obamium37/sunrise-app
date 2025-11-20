"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import styles from "./colleges.module.css";
import NewCollegeModal from "@/components/NewCollegeModal";

export default function CollegesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [addCollegeFormVisible, setAddCollegeFormVisible] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) {
      return; // Let layout handle auth
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
  }, [user]);

  const handleAddCollege = async (collegeData) => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!collegeData.name || !collegeData.deadline) {
      setErrorMsg("College name and deadline are required.");
      return false;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "colleges"), {
        collegeName: collegeData.name,
        deadline: collegeData.deadline,
        deadlineType: collegeData.deadlineType,
        appType: collegeData.appType,
        activityTemplateType: collegeData.appType,
        collegeId: collegeData.collegeId,
        addedAt: new Date().toISOString(),
      });

      setSuccessMsg("College added successfully!");
      return true;
    } catch (err) {
      console.error("Add college error:", err);
      setErrorMsg("Failed to add college: " + err.message);
      return false;
    }
  };

  const handleDeleteCollege = async (collegeId, collegeName) => {
    // Confirm deletion
    const confirmDelete = confirm(
      `Are you sure you want to delete "${collegeName}" from your list?\n\nNote: This will also delete all activity lists associated with this application type if no other colleges use it.`
    );
    
    if (!confirmDelete) return;

    setDeletingId(collegeId);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Delete the college document
      await deleteDoc(doc(db, "users", user.uid, "colleges", collegeId));
      
      setSuccessMsg(`"${collegeName}" has been removed from your list.`);
    } catch (err) {
      console.error("Delete college error:", err);
      setErrorMsg("Failed to delete college: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles["container"]}>
      <div className={styles["content"]}>
        <h2>Your Colleges</h2>
        
        {errorMsg && <p className={styles.error}>{errorMsg}</p>}
        {successMsg && <p className={styles.success}>{successMsg}</p>}
        
        <div className={styles["add-college-button-container"]}>
          <button
            className={styles["add-college-button"]}
            onClick={() => setAddCollegeFormVisible(true)}
          >
            Add a college
          </button>
        </div>
        
        {addCollegeFormVisible && (
          <NewCollegeModal
            setIsOpen={setAddCollegeFormVisible}
            onSubmit={handleAddCollege}
          />
        )}

        {colleges.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No colleges added yet.</p>
            <p>Click "Add a college" to get started building your college list.</p>
          </div>
        ) : (
          <table className={styles["table"]}>
            <thead>
              <tr className={styles["table-header"]}>
                <th scope="col" className={styles["table-column-name"]}>
                  Name
                </th>
                <th scope="col" className={styles["table-column-deadline"]}>
                  Deadline
                </th>
                <th scope="col" className={styles["table-column-actions"]}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {colleges.map((c) => (
                <tr key={c.id}>
                  <td className={styles["table-names"]}>
                    <div className={styles["table-text"]}>
                      <Link href={`/colleges/${c.id}`}>
                        {c.data.collegeName}
                      </Link>
                    </div>
                  </td>
                  <td className={styles["table-deadlines"]}>
                    <div className={styles["table-text"]}>
                      {c.data.deadlineType && (
                        <div style={{ fontSize: "0.9em", color: "#666" }}>
                          {c.data.deadlineType}
                        </div>
                      )}
                      {c.data.deadline}
                    </div>
                  </td>
                  <td className={styles["table-actions"]}>
                    <button
                      className={styles["delete-button"]}
                      onClick={() => handleDeleteCollege(c.id, c.data.collegeName)}
                      disabled={deletingId === c.id}
                      title="Delete college"
                    >
                      {deletingId === c.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}