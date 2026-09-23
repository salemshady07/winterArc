"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Palette, Plus } from "lucide-react";
import type { Person } from "@/lib/types";
import { DEFAULT_THEME, THEME_STORAGE_KEY, isThemeId } from "@/lib/themes";
import { getInitial } from "@/lib/utils";
import { CounterCard } from "@/components/counter-card";
import { PeoplePanel } from "@/components/people-panel";
import {
  AddPersonModal,
  ChangePersonModal,
  HistoryModal,
} from "@/components/modals";
import { ThemePickerModal } from "@/components/theme-picker";

const CURRENT_USER_KEY = "pullup-current-user";

type ModalKind = "add" | "change" | "history" | "theme" | null;

function applyThemeToDocument(themeId: string) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", themeId);
  }
}

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function PullUpApp() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [historyId, setHistoryId] = useState<number | null>(null);
  const [pop, setPop] = useState(0);
  const [theme, setTheme] = useState<string>(DEFAULT_THEME);

  const current = useMemo(
    () => people.find((person) => String(person.id) === currentId) ?? null,
    [people, currentId],
  );

  const historyPerson =
    people.find((person) => person.id === historyId) ?? null;

  /* ---- Initial load: people + saved theme ---- */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [peopleRes, themeRes] = await Promise.all([
          fetch("/api/people", { cache: "no-store" }),
          fetch("/api/theme", { cache: "no-store" }),
        ]);

        const peopleData = (await peopleRes.json()) as Person[];
        const themeData = (await themeRes.json().catch(() => null)) as {
          theme?: string | null;
        } | null;

        if (cancelled) return;

        setPeople(peopleData);

        const savedId = window.localStorage.getItem(CURRENT_USER_KEY);
        if (savedId && peopleData.some((p) => String(p.id) === savedId)) {
          setCurrentId(savedId);
        } else if (peopleData.length > 0) {
          const first = String(peopleData[0].id);
          setCurrentId(first);
          window.localStorage.setItem(CURRENT_USER_KEY, first);
        }

        // The server-saved theme wins (it syncs across devices),
        // with localStorage as an instant no-flash fallback.
        const serverTheme = themeData?.theme ?? null;
        const localTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
        const resolved = isThemeId(serverTheme)
          ? serverTheme
          : isThemeId(localTheme)
            ? localTheme
            : DEFAULT_THEME;

        applyThemeToDocument(resolved);
        setTheme(resolved);
        window.localStorage.setItem(THEME_STORAGE_KEY, resolved);
      } catch {
        // Offline or cold start — keep the defaults.
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---- Escape closes any open modal ---- */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* ---- Actions ---- */

  const selectUser = useCallback((id: number) => {
    setCurrentId(String(id));
    window.localStorage.setItem(CURRENT_USER_KEY, String(id));
    setModal(null);
  }, []);

  const addPerson = useCallback(
    async (name: string): Promise<string | null> => {
      try {
        const res = await fetch("/api/people", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        const data: unknown = await res.json().catch(() => null);

        if (!res.ok) {
          return (
            (data as { error?: string } | null)?.error ??
            "Something went wrong. Try again."
          );
        }

        const created = data as Person;
        setPeople((prev) => [...prev, created]);
        selectUser(created.id);
        return null;
      } catch {
        return "Network error. Try again.";
      }
    },
    [selectUser],
  );

  const changeReps = useCallback(
    async (action: "plus" | "minus") => {
      if (!current) {
        setModal("add");
        return;
      }

      const id = current.id;

      // Optimistic update so the UI feels instant.
      setPeople((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                repsLeft:
                  action === "plus" ? p.repsLeft + 3 : Math.max(0, p.repsLeft - 3),
                plus3: p.plus3 + (action === "plus" ? 1 : 0),
                minus3: p.minus3 + (action === "minus" ? 1 : 0),
              }
            : p,
        ),
      );
      setPop((n) => n + 1);

      try {
        const res = await fetch(`/api/people/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });

        if (res.ok) {
          const updated = (await res.json()) as Person;
          setPeople((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p)),
          );
        }
      } catch {
        // Keep the optimistic state; it will resync on next load.
      }
    },
    [current],
  );

  const changeTheme = useCallback((themeId: string) => {
    if (!isThemeId(themeId)) return;
    applyThemeToDocument(themeId);
    setTheme(themeId);
    window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
    fetch("/api/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: themeId }),
    }).catch(() => undefined);
  }, []);

  const openHistory = useCallback((id: number) => {
    setHistoryId(id);
    setModal("history");
  }, []);

  /* ---- Render ---- */

  return (
    <div className="app-shell">
      <motion.header
        className="header"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: easeOut }}
      >
        <div className="brand">
          <div className="brand-icon">
            <Dumbbell size={24} strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="brand-title font-display">
              PullUp<span>Reminder</span>
            </h1>
            <p className="brand-sub">Remember your reps. Keep going.</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="icon-btn"
            onClick={() => setModal("theme")}
            aria-label="Choose theme"
            title="Themes"
          >
            <Palette size={17} strokeWidth={2.2} />
          </button>
          <button className="btn-add" onClick={() => setModal("add")}>
            <Plus size={16} strokeWidth={3} />
            Add Person
          </button>
        </div>
      </motion.header>

      <motion.section
        className="person-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: easeOut, delay: 0.06 }}
      >
        {loaded ? (
          <>
            <div className="person-info">
              <div className={current ? "avatar avatar-active" : "avatar"}>
                {current ? getInitial(current.name) : "?"}
              </div>
              <div style={{ minWidth: 0 }}>
                <p className="label">You are</p>
                <h2 className="person-name font-display">
                  {current ? current.name : "No person selected"}
                </h2>
              </div>
            </div>
            <button
              className="change-btn"
              onClick={() => setModal("change")}
              disabled={people.length === 0}
              style={people.length === 0 ? { opacity: 0.45 } : undefined}
            >
              Change
            </button>
          </>
        ) : (
          <>
            <div className="person-info">
              <div className="skel" style={{ width: 44, height: 44, borderRadius: "50%" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div className="skel" style={{ width: 52, height: 8 }} />
                <div className="skel" style={{ width: 110, height: 15 }} />
              </div>
            </div>
            <div className="skel" style={{ width: 70, height: 32, borderRadius: 10 }} />
          </>
        )}
      </motion.section>

      <motion.main
        className="main-grid"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut, delay: 0.12 }}
      >
        <CounterCard
          loaded={loaded}
          user={current}
          pop={pop}
          onPlus={() => changeReps("plus")}
          onMinus={() => changeReps("minus")}
        />
        <PeoplePanel
          loaded={loaded}
          people={people}
          currentId={currentId}
          onHistory={openHistory}
        />
      </motion.main>

      <footer className="footer">
        <p>PullUp Reminder &bull; One more rep.</p>
      </footer>

      <AddPersonModal
        open={modal === "add"}
        onClose={() => setModal(null)}
        onCreate={addPerson}
      />
      <ChangePersonModal
        open={modal === "change"}
        people={people}
        currentId={currentId}
        onClose={() => setModal(null)}
        onSelect={selectUser}
      />
      <HistoryModal
        open={modal === "history" && historyPerson !== null}
        person={historyPerson}
        onClose={() => setModal(null)}
      />
      <ThemePickerModal
        open={modal === "theme"}
        theme={theme}
        onClose={() => setModal(null)}
        onSelect={changeTheme}
      />
    </div>
  );
}
