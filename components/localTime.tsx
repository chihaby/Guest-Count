"use client";

import { useEffect, useState } from "react";
import styles from "../styles/localTime.module.css";

export default function LocalTime() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      {/* <p className={styles.label}>Local Time</p> */}
      <h2 className={styles.time}>{currentTime}</h2>
    </div>
  );
}