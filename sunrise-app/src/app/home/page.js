"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import SidebarLayout from "../../components/SidebarLayout";
import Link from "next/link";
import styles from "./home.module.css";
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';


export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [value, setValue] = useState(new Date());

  const [stats, setStats] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    const fetchStats = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          router.push("/onboarding");
          return;
        }

        const data = snap.data();

        if (!data.name || !data.city) {
          setErrorMsg("Missing user data.");
          return;
        }

        setStats(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setErrorMsg("Failed to load data: " + err.message);
      }
    };

    fetchStats();
  }, [user, router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  if (errorMsg) return <p style={{ color: "red" }}>{errorMsg}</p>;
  if (!stats) return <p>Loading...</p>;

  return (
    <div className={styles['container']}>

      <div className={styles['content']}>
        <h1>Welcome, {stats.name} 👋</h1>
        <p>📍 City: {stats.city}</p>
        <p>
          🎓 GPA: {stats.gpa} ({stats.weighted === "true" ? "Weighted" : "Unweighted"})
        </p>
        <p>🧮 {stats.testType}: {stats.testScore}</p>
        <p>🌎 Preferred Region: {stats.location}</p>
        <p>🏫 Cost Preference: {stats.costPref}</p>
        <p>⭐ Major Prestige Importance: {stats.majorPrestige}/5</p>

        <div style={{ padding: '2rem' }}>
        <h1></h1>
        <Calendar onChange={setValue} value={value} />
        <p>Selected date: {value.toDateString()}</p>
        </div>

      </div>
    </div>
  );
}