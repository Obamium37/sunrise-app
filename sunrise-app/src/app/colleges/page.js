"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, onSnapshot, addDoc } from "firebase/firestore";
import { encryptData, decryptData } from "../../lib/crypto";
import Link from "next/link";
import { isCommonAppCollege } from "../../lib/collegeClassification";
import SidebarLayout from "../../components/SidebarLayout";
import styles from "./colleges.module.css";
import NewCollegeModal from "@/components/NewCollegeModal";
import mapboxgl from "mapbox-gl";
import axios from "axios";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function CollegesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [addCollegeFormVisible, setAddCollegeFormVisible] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [newCollegeName, setNewCollegeName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
      setColleges(arr);
    });

    return () => unsub();
  }, [user, router]);

  const handleAddCollege = async (e) => {
    setErrorMsg("");

    if (!newCollegeName || !deadline) {
      setErrorMsg("College name and deadline are required.");
      return false;
    }

    try {
      const encName = await encryptData(user.uid, newCollegeName);
      const encDeadline = await encryptData(user.uid, deadline);

      const appType = isCommonAppCollege(newCollegeName)
        ? "commonApp"
        : "other";

      let lat = null;
      let lng = null;

      try {
        const res = await axios.get(
          "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
            encodeURIComponent(newCollegeName) +
            ".json",
          {
            params: {
              access_token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
              limit: 1,
            },
          }
        );

        if (res.data.features?.length) {
          lng = res.data.features[0].center[0];
          lat = res.data.features[0].center[1];
        }
      } catch {}

      await addDoc(collection(db, "users", user.uid, "colleges"), {
        encryptedCollegeName: encName,
        encryptedDeadline: encDeadline,
        appType,
        activityTemplateType: appType,
        lat,
        lng,
      });

      setNewCollegeName("");
      setDeadline("");
      return true;
    } catch (err) {
      console.error("Add college error:", err);
      setErrorMsg("Failed to add college: " + err.message);
      return false;
    }
  };

  useEffect(() => {
    if (!user || colleges.length === 0) return;

    const map = new mapboxgl.Map({
      container: "college-map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-98.5795, 39.8283],
      zoom: 3,
    });

    colleges.forEach((c) => {
      if (!c.data.lat || !c.data.lng) return;

      const el = document.createElement("div");
      el.innerHTML = "📍";
      el.style.fontSize = "24px";
      el.style.cursor = "pointer";

      const marker = new mapboxgl.Marker(el)
        .setLngLat([c.data.lng, c.data.lat])
        .addTo(map);

      decryptData(user.uid, c.data.encryptedCollegeName).then((name) => {
        marker.setPopup(
          new mapboxgl.Popup({ offset: 20 }).setHTML(
            `<strong>${name}</strong><br/><a href="/colleges/${c.id}">View College →</a>`
          )
        );
      });
    });

    return () => map.remove();
  }, [colleges, user]);

  return (
    <div className={styles["container"]}>
      <div className={styles["content"]}>
        <h2>Your Colleges</h2>

        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

        <div className={styles["add-college-button-container"]}>
          <button
            className={styles["add-college-button"]}
            onClick={() => setAddCollegeFormVisible(true)}
          >
            Add a college
          </button>
        </div>

        {addCollegeFormVisible && (
          <NewCollegeModal
            setIsOpen={setAddCollegeFormVisible}
            onSubmit={handleAddCollege}
            newCollegeName={newCollegeName}
            setNewCollegeName={setNewCollegeName}
            deadline={deadline}
            setDeadline={setDeadline}
          />
        )}

        {colleges.length === 0 ? (
          <p>No colleges added yet.</p>
        ) : (
          <table className={styles["table"]}>
            <thead>
              <tr className={styles["table-header"]}>
                <th className={styles["table-column-name"]}>Name</th>
                <th className={styles["table-column-deadline"]}>Deadline</th>
              </tr>
            </thead>
            <tbody>
              {colleges.map((c) => (
                <tr key={c.id}>
                  <td className={styles["table-names"]}>
                    <div className={styles["table-text"]}>
                      <Link href={`/colleges/${c.id}`}>
                        <DecryptCollegeName
                          userId={user.uid}
                          encrypted={c.data.encryptedCollegeName}
                        />
                      </Link>
                    </div>
                  </td>
                  <td className={styles["table-deadlines"]}>
                    <div className={styles["table-text"]}>
                      {c.data.appType}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {colleges.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h3>Your Colleges on the Map</h3>
            <div
              id="college-map"
              style={{
                height: "400px",
                border: "2px solid black",
                borderRadius: "8px",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function DecryptCollegeName({ userId, encrypted }) {
  const [name, setName] = useState("");

  useEffect(() => {
    decryptData(userId, encrypted)
      .then((dec) => setName(dec || "Unknown"))
      .catch(() => setName("Unknown"));
  }, [userId, encrypted]);

  return <>{name}</>;
}
