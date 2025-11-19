"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import Link from "next/link";
import styles from "./signup.module.css";
import { parseFirebaseError } from "../../lib/firebaseErrors";
import { Button } from "@/components/retroui/Button";

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
      setErrorMsg(parseFirebaseError(err));
    }
  };

  return (
    <div className={styles['signup-box']}>
      <h2 className={styles['header']}>Sign Up</h2>
      {errorMsg && (
        <p style={{ color: "red", marginBottom: "1rem", fontSize: "0.9rem" }}>
          {errorMsg}
        </p>
      )}
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
        <div className={styles['spacer']}></div>
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
          <label htmlFor="showPassword"> Show password</label>
        </div>

        <div className={styles['submit-button-container']}>
          <Button className={styles['submit-button']} type="submit">Sign Up</Button>
        </div>
      </form>

      <p style={{ textAlign: "center", marginTop: "1.4rem" }}>
        Already have an account? <Link href="/" style={{ color: "rgb(122, 156, 149)"}}>Login</Link>
      </p>
    </div>
  );
}
