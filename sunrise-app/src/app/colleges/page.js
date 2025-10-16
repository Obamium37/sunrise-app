"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function Colleges() {
  const { user } = useAuth();
  const router = useRouter();
  const [colleges, setColleges] = useState([]);
  const [newCollegeName, setNewCollegeName] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    const q = query(
      collection(db, "colleges"),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const arr = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setColleges(arr);
    });
    return () => unsubscribe();
  }, [user, router]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!newCollegeName || !newDeadline) {
      setError("Both name and deadline are required.");
      return;
    }
    try {
      await addDoc(collection(db, "colleges"), {
        userId: user.uid,
        name: newCollegeName,
        deadline: newDeadline,
        created: new Date().toISOString(),
      });
      setNewCollegeName("");
      setNewDeadline("");
    } catch (err) {
      setError("Error adding college: " + err.message);
    }
  };

  return (
    <div>
      <h2>Your Colleges</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleAdd}>
        <input
          placeholder="College Name"
          value={newCollegeName}
          onChange={(e) => setNewCollegeName(e.target.value)}
        />
        <input
          type="date"
          placeholder="Deadline"
          value={newDeadline}
          onChange={(e) => setNewDeadline(e.target.value)}
        />
        <button type="submit">Add College</button>
      </form>

      <ul>
        {colleges.map((c) => (
          <li key={c.id}>
            {c.name} — {c.deadline}
            {/* Could make this a Link to detail page */}
          </li>
        ))}
      </ul>
    </div>
  );
}
