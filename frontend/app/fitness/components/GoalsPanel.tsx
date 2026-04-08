// components/GoalsPanel.tsx
"use client";

import { useState } from "react";
import { formatPace } from "../lib/calculations";
import { colors, fonts } from "../lib/styles";

interface Goal {
  id: string;
  targetType: "weekly_km" | "pace" | "streak";
  targetValue: number;
  deadline: string | null;
}

interface Run {
  date: string;
  distanceKm: number;
  paceMinKm: number;
}

interface GoalsPanelProps {
  goals: Goal[];
  runs: Run[];
  onAddGoal: (goal: {
    targetType: string;
    targetValue: number;
    deadline: string | null;
  }) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
}

// Calculate progress for each goal type
function getProgress(
  goal: Goal,
  runs: Run[]
): { current: number; percentage: number; label: string; currentLabel: string } {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekRuns = runs.filter((r) => new Date(r.date) >= weekAgo);

  switch (goal.targetType) {
    case "weekly_km": {
      const weekDist = weekRuns.reduce((s, r) => s + r.distanceKm, 0);
      const pct = Math.min(100, Math.round((weekDist / goal.targetValue) * 100));
      return {
        current: Math.round(weekDist * 10) / 10,
        percentage: pct,
        label: `${goal.targetValue} km / week`,
        currentLabel: `${(Math.round(weekDist * 10) / 10).toFixed(1)} km`,
      };
    }
    case "pace": {
      if (weekRuns.length === 0) {
        return {
          current: 0,
          percentage: 0,
          label: `${formatPace(goal.targetValue)} /km target`,
          currentLabel: "No runs this week",
        };
      }
      const avgPace =
        weekRuns.reduce((s, r) => s + r.paceMinKm, 0) / weekRuns.length;
      // Lower pace is better, so invert the percentage
      const pct = Math.min(100, Math.round((goal.targetValue / avgPace) * 100));
      return {
        current: Math.round(avgPace * 100) / 100,
        percentage: pct,
        label: `${formatPace(goal.targetValue)} /km target`,
        currentLabel: `${formatPace(avgPace)} /km avg`,
      };
    }
    case "streak": {
      // Calculate current streak
      let streak = 0;
      const sortedDates = [
        ...new Set(runs.map((r) => r.date)),
      ]
        .sort()
        .reverse();
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
      const pct = Math.min(100, Math.round((streak / goal.targetValue) * 100));
      return {
        current: streak,
        percentage: pct,
        label: `${goal.targetValue} day streak`,
        currentLabel: `${streak} day${streak !== 1 ? "s" : ""}`,
      };
    }
    default:
      return { current: 0, percentage: 0, label: "", currentLabel: "" };
  }
}

const goalTypeLabels: Record<string, string> = {
  weekly_km: "Weekly distance",
  pace: "Pace target",
  streak: "Run streak",
};

const goalTypeIcons: Record<string, string> = {
  weekly_km: "km",
  pace: "min/km",
  streak: "days",
};

export function GoalsPanel({ goals, runs, onAddGoal, onDeleteGoal }: GoalsPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [targetType, setTargetType] = useState("weekly_km");
  const [targetValue, setTargetValue] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const val = parseFloat(targetValue);
    if (!val || val <= 0) return;
    setSaving(true);
    await onAddGoal({
      targetType,
      targetValue: val,
      deadline: deadline || null,
    });
    setTargetValue("");
    setDeadline("");
    setShowForm(false);
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    background: colors.surface2,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.mono,
    outline: "none",
  };

  return (
    <div>
      {/* Goal cards */}
      {goals.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {goals.map((goal) => {
            const progress = getProgress(goal, runs);
            const isComplete = progress.percentage >= 100;

            return (
              <div
                key={goal.id}
                style={{
                  background: colors.surface,
                  border: `1px solid ${isComplete ? colors.green + "40" : colors.border}`,
                  borderRadius: 16,
                  padding: "16px 20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: colors.text3,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 4,
                      }}
                    >
                      {goalTypeLabels[goal.targetType]}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>
                      {progress.label}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: colors.text3,
                      cursor: "pointer",
                      fontSize: 16,
                      padding: "4px 8px",
                      borderRadius: 6,
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    background: colors.surface2,
                    borderRadius: 6,
                    height: 8,
                    overflow: "hidden",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progress.percentage}%`,
                      background: isComplete
                        ? colors.green
                        : `linear-gradient(90deg, ${colors.accent}, ${colors.accent2})`,
                      borderRadius: 6,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: isComplete ? colors.green : colors.accent, fontFamily: fonts.mono, fontWeight: 600 }}>
                    {progress.currentLabel}
                  </span>
                  <span style={{ color: colors.text3 }}>
                    {isComplete ? "Goal reached!" : `${progress.percentage}%`}
                  </span>
                </div>

                {goal.deadline && (
                  <div style={{ fontSize: 11, color: colors.text3, marginTop: 6 }}>
                    Deadline: {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {goals.length === 0 && !showForm && (
        <div
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 20,
            padding: "40px 20px",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
          <div style={{ fontSize: 14, color: colors.text2, marginBottom: 4 }}>
            No goals set yet
          </div>
          <div style={{ fontSize: 12, color: colors.text3 }}>
            Set a target to track your progress
          </div>
        </div>
      )}

      {/* Add goal form */}
      {showForm ? (
        <div
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 20,
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ color: colors.accent }}>🎯</span> Set a goal
          </div>

          {/* Goal type selector */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 11,
                color: colors.text3,
                display: "block",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Goal type
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { key: "weekly_km", label: "Weekly km" },
                { key: "pace", label: "Pace" },
                { key: "streak", label: "Streak" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTargetType(t.key)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background:
                      targetType === t.key ? colors.accent + "20" : "transparent",
                    color: targetType === t.key ? colors.accent : colors.text3,
                    border: `1px solid ${
                      targetType === t.key ? colors.accent + "40" : colors.border
                    }`,
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: fonts.sans,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target value */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 11,
                color: colors.text3,
                display: "block",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Target ({goalTypeIcons[targetType]})
            </label>
            <input
              type="number"
              min="0"
              step={targetType === "pace" ? "0.1" : "1"}
              placeholder={
                targetType === "weekly_km"
                  ? "e.g. 20"
                  : targetType === "pace"
                  ? "e.g. 5.5"
                  : "e.g. 7"
              }
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              style={inputStyle}
            />
            <div style={{ fontSize: 11, color: colors.text3, marginTop: 4 }}>
              {targetType === "weekly_km" && "Total kilometres to run each week"}
              {targetType === "pace" && "Target average pace in min/km (lower is faster)"}
              {targetType === "streak" && "Number of consecutive days to run"}
            </div>
          </div>

          {/* Deadline (optional) */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                fontSize: 11,
                color: colors.text3,
                display: "block",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Deadline (optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={{ ...inputStyle, colorScheme: "dark" }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowForm(false)}
              style={{
                flex: 1,
                padding: 12,
                background: "transparent",
                color: colors.text2,
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: fonts.sans,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!targetValue || parseFloat(targetValue) <= 0}
              style={{
                flex: 2,
                padding: 12,
                background:
                  targetValue && parseFloat(targetValue) > 0
                    ? `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`
                    : colors.surface2,
                color:
                  targetValue && parseFloat(targetValue) > 0 ? "#fff" : colors.text3,
                border: "none",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                cursor:
                  targetValue && parseFloat(targetValue) > 0
                    ? "pointer"
                    : "not-allowed",
                fontFamily: fonts.sans,
                transition: "all 0.3s",
                transform: saving ? "scale(0.97)" : "scale(1)",
              }}
            >
              {saving ? "Saving..." : "Set goal"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: "100%",
            padding: 14,
            background: "transparent",
            color: colors.accent,
            border: `1px dashed ${colors.accent}40`,
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: fonts.sans,
            transition: "all 0.2s",
          }}
        >
          + Add a goal
        </button>
      )}
    </div>
  );
}
