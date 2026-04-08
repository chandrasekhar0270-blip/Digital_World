// components/StatCards.tsx
"use client";

import { colors, fonts } from "../lib/styles";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  glow?: boolean;
}

export function StatCard({ label, value, unit, glow }: StatCardProps) {
  return (
    <div
      style={{
        background: glow ? colors.accentGlow : colors.surface,
        border: `1px solid ${glow ? colors.accent + "30" : colors.border}`,
        borderRadius: 16,
        padding: "16px 18px",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: colors.text3,
          fontFamily: fonts.sans,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: glow ? colors.accent : colors.text,
            fontFamily: fonts.mono,
            letterSpacing: "-0.03em",
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 11, color: colors.text3, fontFamily: fonts.sans }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
