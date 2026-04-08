// app/dashboard/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { RunLogForm } from "../components/RunLogForm";
import { StatCard } from "../components/StatCards";
import { PaceChart } from "../components/PaceChart";
import { RunHistory } from "../components/RunHistory";
import { PersonalBests } from "../components/PersonalBests";
import { GoalsPanel } from "../components/GoalsPanel";
import { CoachPanel } from "../components/CoachPanel";
import { formatPace } from "../lib/calculations";
import { colors, fonts } from "../lib/styles";

// ── Types ──
interface Run {
  id: string;
  date: string;
  distanceKm: number;
  durationSec: number;
  speedKmh: number;
  paceMinKm: number;
}

interface Goal {
  id: string;
  targetType: "weekly_km" | "pace" | "streak";
  targetValue: number;
  deadline: string | null;
}

// ── API helpers ──
async function fetchRuns(): Promise<Run[]> {
  const res = await fetch("/api/fitness/runs");
  if (!res.ok) throw new Error("Failed to fetch runs");
  return res.json();
}

async function createRun(run: {
  date: string;
  distanceKm: number;
  durationSec: number;
}): Promise<Run> {
  const res = await fetch("/api/fitness/runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(run),
  });
  if (!res.ok) throw new Error("Failed to log run");
  return res.json();
}

async function deleteRun(id: string): Promise<void> {
  const res = await fetch(`/api/fitness/runs/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete run");
}

async function fetchGoals(): Promise<Goal[]> {
  const res = await fetch("/api/fitness/goals");
  if (!res.ok) throw new Error("Failed to fetch goals");
  return res.json();
}

async function createGoal(goal: {
  targetType: string;
  targetValue: number;
  deadline: string | null;
}): Promise<Goal> {
  const res = await fetch("/api/fitness/goals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(goal),
  });
  if (!res.ok) throw new Error("Failed to create goal");
  return res.json();
}

async function deleteGoal(id: string): Promise<void> {
  const res = await fetch(`/api/fitness/goals?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete goal");
}

export default function DashboardPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const [runs, setRuns] = useState<Run[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [view, setView] = useState<"log" | "stats" | "goals" | "coach" | "history">("log");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchRuns(), fetchGoals()])
      .then(([runsData, goalsData]) => {
        setRuns(runsData);
        setGoals(goalsData);
        setLoaded(true);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load data. Check your DATABASE_URL in .env.local");
        setLoaded(true);
      });
  }, []);

  // ── Run handlers ──
  const handleLogRun = useCallback(
    async (run: {
      date: string;
      distanceKm: number;
      durationSec: number;
      speedKmh: number;
      paceMinKm: number;
    }) => {
      try {
        const newRun = await createRun({
          date: run.date,
          distanceKm: run.distanceKm,
          durationSec: run.durationSec,
        });
        setRuns((prev) =>
          [...prev, newRun].sort((a, b) => a.date.localeCompare(b.date))
        );
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to log run. Please try again.");
      }
    },
    []
  );

  const handleDeleteRun = useCallback(async (id: string) => {
    try {
      await deleteRun(id);
      setRuns((prev) => prev.filter((r) => r.id !== id));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete run.");
    }
  }, []);

  // ── Goal handlers ──
  const handleAddGoal = useCallback(
    async (goal: {
      targetType: string;
      targetValue: number;
      deadline: string | null;
    }) => {
      try {
        const newGoal = await createGoal(goal);
        setGoals((prev) => [newGoal, ...prev]);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to create goal.");
      }
    },
    []
  );

  const handleDeleteGoal = useCallback(async (id: string) => {
    try {
      await deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete goal.");
    }
  }, []);

  // ── Computed stats ──
  const totalDist = runs.reduce((s, r) => s + r.distanceKm, 0);
  const totalDur = runs.reduce((s, r) => s + r.durationSec, 0);
  const avgPace = runs.length ? totalDur / 60 / totalDist : 0;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekDist = runs
    .filter((r) => new Date(r.date) >= weekAgo)
    .reduce((s, r) => s + r.distanceKm, 0);

  // Streak
  let streak = 0;
  const sortedDates = Array.from(new Set(runs.map((r) => r.date))).sort().reverse();
  let checkDate = new Date(new Date().toISOString().split("T")[0]);
  for (const d of sortedDates) {
    const diff = Math.round(
      (checkDate.getTime() - new Date(d).getTime()) / 86400000
    );
    if (diff <= 1) {
      streak++;
      checkDate = new Date(d);
    } else break;
  }

  // ── Nav button ──
  const NavBtn = ({
    label,
    icon,
    active,
    onClick,
  }: {
    label: string;
    icon: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "12px 0",
        background: active ? colors.accent : "transparent",
        color: active ? "#fff" : colors.text2,
        border: active ? "none" : `1px solid ${colors.border}`,
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: fonts.sans,
        transition: "all 0.25s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
      }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      {label}
    </button>
  );

  if (!loaded || !userLoaded) {
    return (
      <div
        style={{
          background: colors.bg,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fonts.sans,
          color: colors.text2,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        background: colors.bg,
        minHeight: "100vh",
        fontFamily: fonts.sans,
        color: colors.text,
        padding: "0 0 40px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", padding: "32px 20px 24px", position: "relative" }}>
        <div style={{ position: "absolute", top: 24, right: 24 }}>
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: { avatarBox: { width: 36, height: 36 } },
            }}
          />
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em" }}>
            RunPulse
          </span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: colors.text3,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {user?.firstName ? `Welcome back, ${user.firstName}` : "Track. Analyse. Improve."}
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px" }}>
        {/* Error banner */}
        {error && (
          <div
            style={{
              background: "rgba(244,67,54,0.15)",
              border: "1px solid rgba(244,67,54,0.3)",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 16,
              fontSize: 13,
              color: "#ef5350",
              fontFamily: fonts.sans,
            }}
          >
            {error}
          </div>
        )}

        {/* Navigation — 5 tabs */}
        <div style={{ display: "flex", gap: 5, marginBottom: 20 }}>
          <NavBtn label="Log" icon="+" active={view === "log"} onClick={() => setView("log")} />
          <NavBtn label="Stats" icon="◈" active={view === "stats"} onClick={() => setView("stats")} />
          <NavBtn label="Goals" icon="◎" active={view === "goals"} onClick={() => setView("goals")} />
          <NavBtn label="Coach" icon="⚡" active={view === "coach"} onClick={() => setView("coach")} />
          <NavBtn label="History" icon="≡" active={view === "history"} onClick={() => setView("history")} />
        </div>

        {/* Quick Stats */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <StatCard label="This week" value={weekDist.toFixed(1)} unit="km" glow />
          <StatCard label="Total runs" value={runs.length} />
          <StatCard label="Streak" value={streak} unit={streak === 1 ? "day" : "days"} />
        </div>

        {/* LOG */}
        {view === "log" && <RunLogForm onLogRun={handleLogRun} />}

        {/* STATS */}
        {view === "stats" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <StatCard label="Total distance" value={totalDist.toFixed(1)} unit="km" />
              <StatCard label="Avg pace" value={formatPace(avgPace)} unit="/km" />
            </div>
            <PaceChart runs={runs} />
            <div style={{ marginTop: 20 }}>
              <PersonalBests runs={runs} />
            </div>
          </div>
        )}

        {/* GOALS */}
        {view === "goals" && (
          <GoalsPanel
            goals={goals}
            runs={runs}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {/* COACH */}
        {view === "coach" && <CoachPanel hasRuns={runs.length > 0} />}

        {/* HISTORY */}
        {view === "history" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text2 }}>
                {runs.length} run{runs.length !== 1 ? "s" : ""} logged
              </div>
            </div>
            <RunHistory runs={runs} onDelete={handleDeleteRun} />
          </div>
        )}
      </div>
    </div>
  );
}
