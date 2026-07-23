"use client";

import { useState, useEffect } from "react";
import CounterCard from "./counterCard";
import Button from "./button";
import LocalTime from "./localTime";
import styles from "../styles/guestCounter.module.css";
import { supabase } from "@/lib/supabase";

interface Event {
  id: string;
  event_name: string;
  guest_count: number;
  active: boolean;
}

export default function GuestCounter() {
  const [event, setEvent] = useState<Event | null>(null);
  const [eventName, setEventName] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function loadEvent() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("active", true)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setEvent(data);
      setEventName(data.event_name);
      setCount(data.guest_count);
    }

    loadEvent();
  }, []);

  async function updateEventName(value: string) {
    setEventName(value);

    if (!event) return;

    const { error } = await supabase
      .from("events")
      .update({
        event_name: value,
      })
      .eq("id", event.id);

    if (error) {
      console.error(error);
      return;
    }

    setEvent({
      ...event,
      event_name: value,
    });
  }

  async function increment() {
    if (!event) return;

    const newCount = count + 1;

    const { error } = await supabase
      .from("events")
      .update({
        guest_count: newCount,
      })
      .eq("id", event.id);

    if (error) {
      console.error(error);
      return;
    }

    setCount(newCount);

    setEvent({
      ...event,
      guest_count: newCount,
    });
  }

  async function decrement() {
    if (!event || count === 0) return;

    const newCount = count - 1;

    const { error } = await supabase
      .from("events")
      .update({
        guest_count: newCount,
      })
      .eq("id", event.id);

    if (error) {
      console.error(error);
      return;
    }

    setCount(newCount);

    setEvent({
      ...event,
      guest_count: newCount,
    });
  }

async function createNewEvent() {
  if (!event) {
    console.log("No active event");
    return;
  }

  console.log("Current event:", event);

  const confirmed = window.confirm(
    "Start a new event? The current event will be archived."
  );

  if (!confirmed) return;

  const { error: deactivateError } = await supabase
    .from("events")
    .update({
      active: false,
    //   ended_at: new Date().toISOString(),
    })
    .eq("id", event.id);

  console.log("Deactivate error:", deactivateError);

  if (deactivateError) return;

  const { data: newEvent, error: insertError } = await supabase
    .from("events")
    .insert({
      event_name: "",
      guest_count: 0,
      active: true,
    })
    .select()
    .single();

  console.log("New Event:", newEvent);
  console.log("Insert Error:", insertError);

  if (insertError) return;

  setEvent(newEvent);
  setEventName("");
  setCount(0);
}

  return (
    <div className={styles.container}>
        <div>
        <button
          className={styles.newEventButton}
          onClick={createNewEvent}
        >
          <span>&#43; </span>New Event
        </button>
      </div>
      <input
        type="text"
        className={styles.eventInput}
        placeholder="Enter Event Name"
        value={eventName}
        onChange={(e) => updateEventName(e.target.value)}
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
          onClick={decrement}
        >
          −
        </Button>

        <Button
          variant="convene_primary"
          onClick={increment}
        >
          +
        </Button>
      </div>

      <div>
        <LocalTime />
        <h1 className={styles.branding}>
          Convene Hospitality Group
        </h1>
      </div>
    </div>
  );
}