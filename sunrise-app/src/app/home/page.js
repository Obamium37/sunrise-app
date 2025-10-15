"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { decryptData } from "../../lib/crypto";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

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
        const decrypted = await decryptData(user.uid, data.encryptedStats);

        setStats({
          name: decrypted.name,
          city: decrypted.city,
          gpa: data.gpa,
          sat: data.sat,
          weighted: data.weighted,
        });
      } catch (err) {
        setErrorMsg("Failed to load data: " + err.message);
      }
    };

    fetchStats();
  }, [user, router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  if (!stats) {
    return <p>{errorMsg || "Loading..."}</p>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "auto", paddingTop: "3rem" }}>
      <h1>Welcome, {stats.name} 👋</h1>
      <p>📍 City: {stats.city}</p>
      <p>
        🎓 GPA: {stats.gpa} ({stats.weighted ? "Weighted" : "Unweighted"})
      </p>
      <p>🧮 SAT: {stats.sat}</p>

      <div style={{ marginTop: "2rem" }}>
        <Link href="/account">⚙️ Account Details</Link>
      </div>

      <button onClick={handleLogout} style={{ marginTop: "2rem" }}>
        Logout
      </button>
    </div>
  );
}
