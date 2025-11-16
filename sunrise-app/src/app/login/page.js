"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
//import "./styles/globals.css";
import styles from "./login.module.css";
import { parseFirebaseError } from "../../lib/firebaseErrors";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        router.push("/home");
      } else {
        router.push("/onboarding");
      }
    } catch (err) {
      setErrorMsg(parseFirebaseError(err));
    }
  };

  return (
    <div className={styles["login-box"]}>
      <h2 className={styles["header"]}>Login</h2>
      <p className={styles["under-header"]}>
        Don&apos;t have an account? <Link href="/signup" style={{ color: "rgb(122, 156, 149)"}}>Sign Up</Link>
      </p>
      {errorMsg && (
      <p style={{ color: "red", marginBottom: "1rem", fontSize: "0.9rem" }}>
        {errorMsg}
      </p>
      )}
      <form className={styles["form"]} onSubmit={handleLogin}>
        <h4 className={styles["account-details-headers"]}>Email</h4>
        <input
          className={styles["account-details-input"]}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className={styles['spacer']}></div>
        <h4 className={styles["account-details-headers"]}>Password</h4>
        <div className={styles["password-field-container"]}>
          <input
            className={styles["account-details-input"]}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className={styles["show-password-container"]}>
            <input
              className={styles["show-password"]}
              type="checkbox"
              id="showPassword"
              onChange={() => setShowPassword((prev) => !prev)}
            />
            <label htmlFor="showPassword"> Show password</label>
          </div>
        </div>

        <div className={styles["submit-button-container"]}>
          <button className={styles["submit-button"]} type="submit">
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
