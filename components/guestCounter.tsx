"use client";

import { useState } from "react";
import CounterCard from "./counterCard";
import Button from "./button";
import styles from "../styles/guestCounter.module.css";
import LocalTime from "./localTime";

export default function GuestCounter() {
  const [eventName, setEventName] = useState<string>("");
  const [count, setCount] = useState<number>(0);

  return (
    <div className={styles.container}>
      <input
        type="text"
        className={styles.eventInput}
        placeholder="Enter Event Name"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
      />

      <h1 className={styles.eventTitle}>
        {eventName || "Untitled Event"}
      </h1>

      <CounterCard
        title="Current Guests"
        count={count}
      />

      <div className={styles.buttons}>
        <Button
          variant="convene_secondary"
          onClick={() => count > 0 && setCount(count - 1)}
        >
          −
        </Button>

        <Button
          variant="convene_primary"
          onClick={() => setCount(count + 1)}
        >
          +
        </Button>
      </div>
      <div>
        <LocalTime />
        <h1 className={styles.branding} style={{}}>Convene Hospitality Group</h1>
      </div>
    </div>
  );
}