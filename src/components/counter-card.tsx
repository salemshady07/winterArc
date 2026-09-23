"use client";

import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import type { Person } from "@/lib/types";
import { repMessage } from "@/lib/utils";

interface CounterCardProps {
  loaded: boolean;
  user: Person | null;
  pop: number;
  onPlus: () => void;
  onMinus: () => void;
}

export function CounterCard({
  loaded,
  user,
  pop,
  onPlus,
  onMinus,
}: CounterCardProps) {
  if (!loaded) {
    return (
      <section className="card reminder-card" aria-hidden="true">
        <div className="skel" style={{ width: 100, height: 9 }} />
        <div
          className="skel"
          style={{ width: 150, height: 104, marginTop: 26, borderRadius: 18 }}
        />
        <div className="skel" style={{ width: 120, height: 12, marginTop: 18 }} />
        <div
          className="controls"
          style={{ pointerEvents: "none" }}
        >
          <div className="skel" style={{ height: 62, borderRadius: 15 }} />
          <div className="skel" style={{ height: 62, borderRadius: 15 }} />
        </div>
      </section>
    );
  }

  const count = user?.repsLeft ?? 0;

  return (
    <section className="card reminder-card">
      <p className="label">Your reps left</p>

      <div className="big-count">
        <div className="count-wrap">
          <motion.div
            key={`halo-${pop}`}
            className="count-halo"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: [0, 0.4, 0], scale: 1.2 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          />
          <motion.span
            key={`count-${user?.id ?? "none"}-${count}`}
            className="count-number font-display"
            initial={{ scale: 1.16, opacity: 0.55, filter: "blur(3px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 340, damping: 20 }}
          >
            {count}
          </motion.span>
        </div>
        <motion.span
          key={`text-${pop}`}
          className="count-text"
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          REPS LEFT
        </motion.span>
      </div>

      <p className="reminder-text">
        {user ? repMessage(count) : "Add yourself to start tracking."}
      </p>

      <div className="controls">
        <button
          className="counter-btn minus"
          onClick={onMinus}
          aria-label="Remove 3 reps"
        >
          <Minus size={21} strokeWidth={3} />
          <span>3</span>
        </button>
        <button
          className="counter-btn plus"
          onClick={onPlus}
          aria-label="Add 3 reps"
        >
          <Plus size={21} strokeWidth={3} />
          <span>3</span>
        </button>
      </div>

      <p className="control-hint">Change your remaining reps by 3</p>
    </section>
  );
}
