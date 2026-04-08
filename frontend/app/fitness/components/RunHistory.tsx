// components/RunHistory.tsx
"use client";

import { useState } from "react";
import { formatDuration, formatPace, formatDate, formatWeekday } from "../lib/calculations";
import { colors, fonts } from "../lib/styles";

interface Run {
  id: string;
  date: string;
  distanceKm: number;
  durationSec: number;
  speedKmh: number;
  paceMinKm: number;
}

interface RunHistoryProps {
  runs: Run[];
  onDelete: (id: string) => void;
}

function RunRow({ run, onDelete }: { run: Run; onDelete: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 16px",
        background: hovered ? colors.surface2 : "transparent",
        borderRadius: 12,
        gap: 14,
        transition: "background 0.2s",
        marginBottom: 2,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          color: "#fff",
          fontFamily: fonts.sans,
          flexShrink: 0,
        }}
      >
        {formatWeekday(run.date)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: colors.text, fontFamily: fonts.sans }}>
          {run.distanceKm.toFixed(1)} km
          <span style={{ color: colors.text3, fontWeight: 400, fontSize: 12, marginLeft: 8 }}>
            {formatDate(run.date)}
          </span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: colors.text2,
            marginTop: 3,
            display: "flex",
            gap: 16,
            fontFamily: fonts.sans,
          }}
        >
          <span>{formatDuration(run.durationSec)}</span>
          <span>{formatPace(run.paceMinKm)} /km</span>
          <span>{run.speedKmh.toFixed(1)} km/h</span>
        </div>
      </div>
      <button
        onClick={() => onDelete(run.id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: colors.text3,
          fontSize: 18,
          padding: "4px 8px",
          borderRadius: 8,
          lineHeight: 1,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
        }}
      >
        ×
      </button>
    </div>
  );
}

export function RunHistory({ runs, onDelete }: RunHistoryProps) {
  return (
    <div
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 20,
        padding: "8px 4px",
      }}
    >
      {runs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px", color: colors.text3 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>+</div>
          <div style={{ fontSize: 14 }}>No runs yet. Log your first one!</div>
        </div>
      ) : (
        [...runs]
          .reverse()
          .map((run) => <RunRow key={run.id} run={run} onDelete={onDelete} />)
      )}
    </div>
  );
}
