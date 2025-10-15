"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import Link from "next/link";
import "./globals.css";
import styles from "./login.module.css";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className={styles['login-box']}>
      <h2 className={styles['header']}>Login</h2>
      <p className={styles['under-header']}>Don&apos;t have an account? <Link href="/signup">Sign Up</Link></p>
      <form className={styles['form']} onSubmit={handleLogin}>
        <h4 className={styles['account-details-headers']}>Email</h4>
        <input className={styles['account-details-input']} type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <h4 className={styles['account-details-headers']}>Password</h4>
        <input className={styles['account-details-input']} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <div className={styles['submit-button-container']}>
          <button className={styles['submit-button']} type="submit">Login</button>  
        </div>
      </form>
    </div>
  );
}
