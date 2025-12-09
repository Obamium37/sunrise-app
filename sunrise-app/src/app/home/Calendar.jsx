"use client"; // Next.js app directory client component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, onSnapshot, addDoc } from "firebase/firestore";
import { encryptData, decryptData } from "../../lib/crypto";
import Link from "next/link";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./home.module.css";


export default function Calendar() {
  const { user } = useAuth();
  const router = useRouter();
    
  // Predefined events
  const [collegeNames, setCollegeNames] = useState([]);

  // query for collegeNames
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
        setCollegeNames(arr);
      });
      return () => unsub();
    }, [user, router]);

  // Handle click on a date
  function handleDateClick(info) {
    // Filter events for the clicked date
    const eventsForDate = events.filter(e => e.start === info.dateStr);

    if (eventsForDate.length === 0) {
      alert(`No events on ${info.dateStr}`);
    } else {
      const titles = eventsForDate.map(e => e.title).join("\n");
      alert(`Events on ${info.dateStr}:\n${titles}`);
    }
  }

 return (
  <div>
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={collegeNames.map(c => ({
        id: c.id,
        title:     
          <DecryptCollegeName userId={user.uid} encrypted={c.data.encryptedCollegeName} />
          ,
        date:
          <DecryptDeadline userId={user.uid} encrypted={c.data.encryptedDeadline} />
          
      }))}
      dateClick={handleDateClick}
    />
    
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

function DecryptDeadline({ userId, encrypted }) {
  const [name, setName] = useState("");
  useEffect(() => {
    decryptData(userId, encrypted)
      .then((dec) => setName(dec || "Unknown"))
      .catch((err) => {
        console.error("Decrypt college name error:", err);
        setName("Unknown");
      });
  }, [userId, encrypted]);

  const reversedName = name.split('').reverse().join('');
  return <>{reversedName}</>;
}
