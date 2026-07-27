"use client";

import { useState, useEffect } from "react";
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

  // Load the current active event
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
    }

    loadEvent();

    // Realtime subscription
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
          console.log("Realtime:", payload);

          const updated = payload.new as Event;

          if (payload.eventType === "INSERT") {
            if (updated.active) {
              setEvent(updated);
            }
            return;
          }

          if (payload.eventType === "UPDATE") {
            if (updated.active) {
              setEvent(updated);
            } else {
              // Active event was archived.
              const { data } = await supabase
                .from("events")
                .select("*")
                .eq("active", true)
                .single();

              if (data) {
                setEvent(data);
              }
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime Status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function updateEventName(value: string) {
    if (!event) return;

    // Optimistic update
    setEvent({
      ...event,
      event_name: value,
    });

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

    const updatedEvent = {
      ...event,
      guest_count: event.guest_count + 1,
    };

    // Instant UI update
    setEvent(updatedEvent);

    const { error } = await supabase
      .from("events")
      .update({
        guest_count: updatedEvent.guest_count,
      })
      .eq("id", event.id);

    if (error) {
      console.error(error);

      // Roll back on failure
      setEvent(event);
    }
  }

  async function decrement() {
    if (!event) return;
    if (event.guest_count === 0) return;

    const updatedEvent = {
      ...event,
      guest_count: event.guest_count - 1,
    };

    setEvent(updatedEvent);

    const { error } = await supabase
      .from("events")
      .update({
        guest_count: updatedEvent.guest_count,
      })
      .eq("id", event.id);

    if (error) {
      console.error(error);

      setEvent(event);
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

    // Realtime will automatically load the new event.
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
        value={event?.event_name ?? ""}
        onChange={(e) => updateEventName(e.target.value)}
      />

      <h1 className={styles.eventTitle}>
        {event?.event_name || "Untitled Event"}
      </h1>

      <CounterCard
        title="Current Guests"
        count={event?.guest_count ?? 0}
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