"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftRight,
  Check,
  LoaderCircle,
  Minus,
  Plus,
  UserRoundPlus,
  X,
} from "lucide-react";
import type { Person } from "@/lib/types";
import { getInitial } from "@/lib/utils";

/* ----------------------------------
   Shared modal shell
---------------------------------- */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, className, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className={className ? `modal ${className}` : "modal"}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <button
              className="close-btn"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <X size={14} strokeWidth={2.6} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ----------------------------------
   Add person
---------------------------------- */

interface AddPersonModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<string | null>;
}

export function AddPersonModal({
  open,
  onClose,
  onCreate,
}: AddPersonModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setError("");
      setBusy(false);
      const timer = window.setTimeout(() => inputRef.current?.focus(), 140);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  const submit = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Please enter at least 2 characters.");
      return;
    }
    setBusy(true);
    setError("");
    const failure = await onCreate(trimmed);
    setBusy(false);
    if (failure) setError(failure);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-icon-circle">
        <UserRoundPlus size={21} strokeWidth={2.2} />
      </div>
      <h2 className="modal-title font-display">Add Person</h2>
      <p className="modal-sub">
        Enter the person&apos;s name to add them. Their reps and history are
        saved forever.
      </p>
      <input
        ref={inputRef}
        type="text"
        className="input"
        placeholder="Enter name"
        maxLength={25}
        autoComplete="off"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !busy) submit();
        }}
      />
      <p className="error">{error}</p>
      <button className="primary-btn" onClick={submit} disabled={busy}>
        {busy ? (
          <LoaderCircle size={15} strokeWidth={2.6} className="spin" />
        ) : null}
        {busy ? "Adding..." : "Add Person"}
      </button>
    </Modal>
  );
}

/* ----------------------------------
   Change person
---------------------------------- */

interface ChangePersonModalProps {
  open: boolean;
  people: Person[];
  currentId: string | null;
  onClose: () => void;
  onSelect: (id: number) => void;
}

export function ChangePersonModal({
  open,
  people,
  currentId,
  onClose,
  onSelect,
}: ChangePersonModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-icon-circle">
        <ArrowLeftRight size={20} strokeWidth={2.2} />
      </div>
      <h2 className="modal-title font-display">Who are you?</h2>
      <p className="modal-sub">Select your name to change your reps.</p>

      <div className="user-selection">
        {people.length === 0 ? (
          <p className="select-empty">
            No one has been added yet. Add a person first.
          </p>
        ) : (
          people.map((person, index) => {
            const selected = String(person.id) === currentId;
            return (
              <motion.button
                key={person.id}
                type="button"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: Math.min(index * 0.04, 0.3),
                  duration: 0.25,
                  ease: "easeOut",
                }}
                className={selected ? "select-user selected" : "select-user"}
                onClick={() => onSelect(person.id)}
              >
                <span className="select-avatar">
                  {getInitial(person.name)}
                </span>
                <span className="select-name">{person.name}</span>
                <span className="select-count">{person.repsLeft} left</span>
                {selected && (
                  <Check
                    size={14}
                    strokeWidth={3}
                    style={{ color: "var(--primary)", flexShrink: 0 }}
                  />
                )}
              </motion.button>
            );
          })
        )}
      </div>
    </Modal>
  );
}

/* ----------------------------------
   Rep history
---------------------------------- */

interface HistoryModalProps {
  open: boolean;
  person: Person | null;
  onClose: () => void;
}

export function HistoryModal({ open, person, onClose }: HistoryModalProps) {
  const total = person ? person.plus3 + person.minus3 : 0;

  return (
    <Modal open={open} onClose={onClose} className="history-modal">
      {person && (
        <>
          <div className="history-person">
            <div className="history-avatar">{getInitial(person.name)}</div>
            <div style={{ minWidth: 0 }}>
              <p className="label">Rep history</p>
              <h2 className="history-name font-display">{person.name}</h2>
            </div>
          </div>

          <div className="history-stats">
            <div className="history-stat add-stat">
              <div className="history-stat-icon">
                <Plus size={17} strokeWidth={3} />
              </div>
              <div>
                <p>+3 Added</p>
                <strong className="font-display">{person.plus3}</strong>
                <span>times</span>
              </div>
            </div>

            <div className="history-stat remove-stat">
              <div className="history-stat-icon">
                <Minus size={17} strokeWidth={3} />
              </div>
              <div>
                <p>−3 Removed</p>
                <strong className="font-display">{person.minus3}</strong>
                <span>times</span>
              </div>
            </div>
          </div>

          <div className="history-total">
            <span>Total changes</span>
            <strong className="font-display">{total}</strong>
          </div>

          <p className="history-note">
            This history belongs only to this person.
          </p>
        </>
      )}
    </Modal>
  );
}
