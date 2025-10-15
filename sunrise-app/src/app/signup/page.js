"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import Link from "next/link";
import styles from "./signup.module.css";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/onboarding");
    } catch (err) {
      setErrorMsg("Signup failed: " + err.message);
    }
  };

  return (
    <div className={styles['signup-box']}>
      <h2 className={styles['header']}>Sign Up</h2>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      <form className={styles['form']} onSubmit={handleSignup}>
        <h4 className={styles['account-details-headers']}>Email</h4>
        <input
          className={styles['account-details-input']}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div>
          <h4 className={styles['account-details-headers']}>Password</h4>
          <input
            className={styles['account-details-input']}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input className={styles['show-password']} type="checkbox" id="showPassword" onChange={() => setShowPassword((prev) => !prev)}></input>
          <label for="showPassword"> Show password</label>
        </div>

        <div className={styles['submit-button-container']}>
          <button className={styles['submit-button']} type="submit">Sign Up</button>
        </div>
      </form>

      <p style={{ textAlign: "center" }}>
        Already have an account? <Link href="/">Login</Link>
      </p>
    </div>
  );
}
