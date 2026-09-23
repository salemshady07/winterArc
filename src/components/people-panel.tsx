"use client";

import { motion } from "framer-motion";
import { History, UsersRound } from "lucide-react";
import type { Person } from "@/lib/types";
import { getInitial } from "@/lib/utils";

interface PeoplePanelProps {
  loaded: boolean;
  people: Person[];
  currentId: string | null;
  onHistory: (id: number) => void;
}

export function PeoplePanel({
  loaded,
  people,
  currentId,
  onHistory,
}: PeoplePanelProps) {
  return (
    <section className="card people-card">
      <div className="section-heading">
        <div>
          <p className="label">Everyone</p>
          <h2 className="people-title font-display">Reps Left</h2>
        </div>
        <span className="people-count">
          {people.length} {people.length === 1 ? "person" : "people"}
        </span>
      </div>

      {!loaded ? (
        <div className="people-list" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="skel"
              style={{ height: 59, borderRadius: 13 }}
            />
          ))}
        </div>
      ) : people.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <UsersRound size={24} strokeWidth={2} />
          </div>
          <p>No one has been added yet.</p>
        </div>
      ) : (
        <div className="people-list">
          {people.map((person, index) => {
            const isCurrent = String(person.id) === currentId;
            return (
              <motion.div
                key={person.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 26,
                  delay: Math.min(index * 0.045, 0.35),
                }}
                className={isCurrent ? "person-row current" : "person-row"}
              >
                <div className="person-row-avatar">
                  {getInitial(person.name)}
                </div>

                <div className="person-row-info">
                  <div className="person-row-name">
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {person.name}
                    </span>
                    {isCurrent && <span className="you-badge">YOU</span>}
                  </div>
                </div>

                <div className="person-row-count">
                  <strong className="font-display">{person.repsLeft}</strong>
                  <span>reps left</span>
                </div>

                <button
                  className="history-btn"
                  onClick={() => onHistory(person.id)}
                  aria-label={`View rep history for ${person.name}`}
                >
                  <History size={13} strokeWidth={2.4} />
                  <span className="history-btn-text">History</span>
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
