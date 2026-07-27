"use client";

import { useState, useEffect, useCallback } from "react";
import CounterCard from "./counterCard";
import Button from "./button";
import LocalTime from "./localTime";
import LogoutButton from "./logoutButton";
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

  const loadActiveEvent = useCallback(async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("active", true)
      .single();

    if (error) {
      console.error("Error loading active event:", error);
      return;
    }

    setEvent(data);
    setEventName(data.event_name);
    setCount(data.guest_count);
  }, []);

  useEffect(() => {
    loadActiveEvent();

    const channel = supabase
      .channel("events-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        async (payload) => {
          console.log("Realtime event:", payload);

          await loadActiveEvent();
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadActiveEvent]);

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
    }
  }

  async function increment() {
    if (!event) return;

    const { error } = await supabase
      .from("events")
      .update({
        guest_count: count + 1,
      })
      .eq("id", event.id);

    if (error) {
      console.error(error);
    }
  }

  async function decrement() {
    if (!event || count === 0) return;

    const { error } = await supabase
      .from("events")
      .update({
        guest_count: count - 1,
      })
      .eq("id", event.id);

    if (error) {
      console.error(error);
    }
  }

  async function createNewEvent() {
    if (!event) return;

    const confirmed = window.confirm(
      "Start a new event? The current event will be archived."
    );

    if (!confirmed) return;

    const { error: deactivateError } = await supabase
      .from("events")
      .update({
        active: false,
      })
      .eq("id", event.id);

    if (deactivateError) {
      console.error(deactivateError);
      return;
    }

    const { error: insertError } = await supabase
      .from("events")
      .insert({
        event_name: "",
        guest_count: 0,
        active: true,
      });

    if (insertError) {
      console.error(insertError);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button
          className={styles.newEventButton}
          onClick={createNewEvent}
        >
          New Event
        </button>

        <LogoutButton />
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

      <div className={styles.footer}>
        <LocalTime />

        <h1 className={styles.branding}>
          Convene Hospitality Group
        </h1>
      </div>
    </div>
  );
}