"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import Link from "next/link"
import styles from "./signup.module.css";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/home");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    // <form onSubmit={handleSignup}>
    //   <h2>Sign Up</h2>
    //   <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
    //   <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
    //   <button type="submit">Sign Up</button>
    //   <p>Already have an account? <Link href="/">Login</Link></p>
    // </form>
      <div className={styles['signup-box']}>
        <h2 className={styles['header']}>Sign Up</h2>
        <form className={styles['form']} onSubmit={handleSignup}>
          <h4 className={styles['account-details-headers']}>Email</h4>
          <input className={styles['account-details-input']} type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <h4 className={styles['account-details-headers']}>Password</h4>
          <input className={styles['account-details-input']} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <div className={styles['submit-button-container']}>
            <button className={styles['submit-button']} type="submit">Sign Up</button>  
          </div>
          <p className={styles['under-button']}>Already have an account? <Link href="/">Login</Link></p>
        </form>
      </div>
  );
}
