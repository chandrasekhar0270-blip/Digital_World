// components/PersonalBests.tsx
"use client";

import { formatPace } from "../lib/calculations";
import { colors, fonts } from "../lib/styles";

interface Run {
  distanceKm: number;
  speedKmh: number;
  paceMinKm: number;
}

interface PersonalBestsProps {
  runs: Run[];
}

export function PersonalBests({ runs }: PersonalBestsProps) {
  if (runs.length === 0) return null;

  const bests = [
    {
      label: "Fastest pace",
      value: formatPace(Math.min(...runs.map((r) => r.paceMinKm))),
      unit: "/km",
    },
    {
      label: "Longest run",
      value: Math.max(...runs.map((r) => r.distanceKm)).toFixed(1),
      unit: "km",
    },
    {
      label: "Top speed",
      value: Math.max(...runs.map((r) => r.speedKmh)).toFixed(1),
      unit: "km/h",
    },
  ];

  return (
    <div
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 20,
        padding: 20,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: colors.text2, marginBottom: 14 }}>
        Personal bests
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {bests.map((pb, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: colors.greenGlow,
              border: `1px solid ${colors.green}20`,
              borderRadius: 12,
              padding: "12px 10px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: colors.text3,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 4,
              }}
            >
              {pb.label}
            </div>
            <div style={{ fontFamily: fonts.mono, fontSize: 18, fontWeight: 700, color: colors.green }}>
              {pb.value}
            </div>
            <div style={{ fontSize: 10, color: colors.text3 }}>{pb.unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
