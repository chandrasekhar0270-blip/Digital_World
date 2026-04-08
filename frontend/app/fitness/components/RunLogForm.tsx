// components/RunLogForm.tsx
"use client";

import { useState } from "react";
import { calculateSpeed, calculatePace, formatPace } from "../lib/calculations";
import { colors, fonts } from "../lib/styles";

interface RunLogFormProps {
  onLogRun: (run: {
    date: string;
    distanceKm: number;
    durationSec: number;
    speedKmh: number;
    paceMinKm: number;
  }) => Promise<void>;
}

export function RunLogForm({ onLogRun }: RunLogFormProps) {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [distance, setDistance] = useState("");
  const [runDate, setRunDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [saving, setSaving] = useState(false);

  // Live calculation
  const totalSec =
    (parseInt(hours) || 0) * 3600 +
    (parseInt(minutes) || 0) * 60 +
    (parseInt(seconds) || 0);
  const dist = parseFloat(distance) || 0;
  const hasInput = totalSec > 0 && dist > 0;
  const speed = hasInput ? calculateSpeed(dist, totalSec) : null;
  const pace = hasInput ? calculatePace(dist, totalSec) : null;

  const handleSubmit = async () => {
    if (!hasInput || !speed || !pace) return;
    setSaving(true);
    await onLogRun({
      date: runDate,
      distanceKm: dist,
      durationSec: totalSec,
      speedKmh: speed,
      paceMinKm: pace,
    });
    setHours("");
    setMinutes("");
    setSeconds("");
    setDistance("");
    setTimeout(() => setSaving(false), 800);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    background: colors.surface2,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.mono,
    textAlign: "center",
    outline: "none",
  };

  return (
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
        <span style={{ color: colors.accent }}>+</span> Log a run
      </div>

      {/* Date */}
      <div style={{ marginBottom: 18 }}>
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
          Date
        </label>
        <input
          type="date"
          value={runDate}
          onChange={(e) => setRunDate(e.target.value)}
          style={{ ...inputStyle, textAlign: "left", colorScheme: "dark" }}
        />
      </div>

      {/* Duration */}
      <div style={{ marginBottom: 18 }}>
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
          Duration
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { val: hours, set: setHours, lbl: "hrs" },
            { val: minutes, set: setMinutes, lbl: "min" },
            { val: seconds, set: setSeconds, lbl: "sec" },
          ].map((f, i) => (
            <div key={i} style={{ flex: 1 }}>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={f.val}
                onChange={(e) => f.set(e.target.value)}
                style={inputStyle}
              />
              <div
                style={{
                  fontSize: 10,
                  color: colors.text3,
                  textAlign: "center",
                  marginTop: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {f.lbl}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distance */}
      <div style={{ marginBottom: 22 }}>
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
          Distance
        </label>
        <div style={{ position: "relative" }}>
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="5.0"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            style={{ ...inputStyle, textAlign: "left", paddingRight: 40 }}
          />
          <span
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 12,
              color: colors.text3,
            }}
          >
            km
          </span>
        </div>
      </div>

      {/* Live Speed/Pace Preview */}
      {speed !== null && pace !== null && (
        <div
          style={{
            background: colors.accentGlow,
            border: `1px solid ${colors.accent}30`,
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 10,
                color: colors.text3,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 4,
              }}
            >
              Speed
            </div>
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 26,
                fontWeight: 700,
                color: colors.accent,
              }}
            >
              {speed.toFixed(1)}
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 400,
                  color: colors.text3,
                  marginLeft: 3,
                }}
              >
                km/h
              </span>
            </div>
          </div>
          <div style={{ width: 1, background: colors.border }} />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 10,
                color: colors.text3,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 4,
              }}
            >
              Pace
            </div>
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 26,
                fontWeight: 700,
                color: colors.accent2,
              }}
            >
              {formatPace(pace)}
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 400,
                  color: colors.text3,
                  marginLeft: 3,
                }}
              >
                /km
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!hasInput}
        style={{
          width: "100%",
          padding: 14,
          background: hasInput
            ? `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`
            : colors.surface2,
          color: hasInput ? "#fff" : colors.text3,
          border: "none",
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 700,
          cursor: hasInput ? "pointer" : "not-allowed",
          fontFamily: fonts.sans,
          transition: "all 0.3s",
          transform: saving ? "scale(0.97)" : "scale(1)",
          boxShadow: hasInput ? `0 4px 20px ${colors.accent}40` : "none",
        }}
      >
        {saving ? "Logged!" : "Log run"}
      </button>
    </div>
  );
}
