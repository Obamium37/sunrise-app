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
import NewCollegeModal from "@/components/NewCollegeModal";

export default function CollegesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [addCollegeFormVisible, setAddCollegeFormVisible] = useState(false);
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
    setErrorMsg("");

    if (!newCollegeName || !deadline) {
      setErrorMsg("College name and deadline are required.");
      return false;
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

      return true;
    } catch (err) {
      console.error("Add college error:", err);
      setErrorMsg("Failed to add college: " + err.message);
      return false;
    }
  };

  return (
    <div className={styles['container']}>
      <SidebarLayout></SidebarLayout>

      <div className={styles['content']}>
        <h2>Your Colleges</h2>
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        <div className={styles['add-college-button-container']}>
          <button className={styles['add-college-button']} onClick={() => setAddCollegeFormVisible(true)}>Add a college</button>
        </div>
        {addCollegeFormVisible && <NewCollegeModal setIsOpen={setAddCollegeFormVisible} onSubmit={handleAddCollege} newCollegeName={newCollegeName} setNewCollegeName={setNewCollegeName} deadline={deadline} setDeadline={setDeadline}></NewCollegeModal>}

        {colleges.length === 0 ? <p>No colleges added yet.</p> :
          <table className={styles['table']}>
            <thead>
                <tr className={styles['table-header']}>
                    <th scope="col" className={styles['table-column-name']}>
                    Name
                    </th>
                    <th scope="col" className={styles['table-column-deadline']}>
                    Deadline
                    </th>
                </tr>
            </thead>
            <tbody>
                {colleges.map((c) => (
                    <tr key={c.id}>
                        <td className={styles['table-names']}>
                            <div className={styles['table-text']}>
                              <Link href={`/colleges/${c.id}`}>
                                  <DecryptCollegeName userId={user.uid} encrypted={c.data.encryptedCollegeName} />
                              </Link>
                            </div>
                        </td>
                        <td className={styles['table-deadlines']}>
                          <div className={styles['table-text']}>
                            {c.data.appType}
                          </div>
                        </td>
                    </tr>
                ))}
            </tbody>
          </table>
        }

        {/* <ul>
          {colleges.map((c) => (
            <li key={c.id} style={{ marginBottom: "0.75rem" }}>
              <Link href={`/colleges/${c.id}`}>
                <DecryptCollegeName userId={user.uid} encrypted={c.data.encryptedCollegeName} />
              </Link>{" "}
              — {c.data.appType}
            </li>
          ))}
          {colleges.length === 0 && <p>No colleges added yet.</p>}
        </ul> */}
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
