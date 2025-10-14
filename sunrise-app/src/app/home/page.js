"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../lib/firebase";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]); // ✅ router added here
  

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  return user ? (
    <div>
      <h1>🎓 Welcome to Your College Application Tracker</h1>
      <ul>
        <li>🏫 Colleges</li>
        <li>💰 Scholarships</li>
        <li>📆 Timeline & Calendar</li>
        <li>📋 Activity Lists</li>
      </ul>
      <button onClick={handleLogout}>Logout</button>
    </div>
  ) : null;
}
