// components/PaceChart.tsx
"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { formatPace, formatDate } from "../lib/calculations";
import { colors, fonts } from "../lib/styles";

interface Run {
  date: string;
  distanceKm: number;
  speedKmh: number;
  paceMinKm: number;
}

interface PaceChartProps {
  runs: Run[];
}

function ChartTooltip({ active, payload, label, type }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: "10px 14px",
        fontFamily: fonts.sans,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ fontSize: 11, color: colors.text3, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: colors.accent, fontFamily: fonts.mono }}>
        {type === "pace"
          ? formatPace(payload[0].value) + " /km"
          : type === "distance"
          ? payload[0].value.toFixed(1) + " km"
          : payload[0].value.toFixed(1) + " km/h"}
      </div>
    </div>
  );
}

export function PaceChart({ runs }: PaceChartProps) {
  const [chartType, setChartType] = useState<"pace" | "distance" | "speed">("pace");

  const chartData = runs.slice(-14).map((r) => ({
    date: formatDate(r.date),
    pace: Math.round(r.paceMinKm * 100) / 100,
    distance: r.distanceKm,
    speed: r.speedKmh,
  }));

  return (
    <div>
      {/* Toggle buttons */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {(["pace", "distance", "speed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setChartType(t)}
            style={{
              padding: "8px 16px",
              background: chartType === t ? colors.accent + "20" : "transparent",
              color: chartType === t ? colors.accent : colors.text3,
              border: `1px solid ${chartType === t ? colors.accent + "40" : colors.border}`,
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: fonts.sans,
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart card */}
      <div
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 20,
          padding: "20px 16px 12px",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: colors.text2, marginBottom: 12, paddingLeft: 4 }}>
          {chartType === "pace" ? "Pace trend" : chartType === "distance" ? "Distance per run" : "Speed trend"}
          <span style={{ fontSize: 11, color: colors.text3, fontWeight: 400, marginLeft: 8 }}>
            Last 14 runs
          </span>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          {chartType === "distance" ? (
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: colors.text3 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: colors.text3 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip type="distance" />} />
              <Bar dataKey="distance" fill={colors.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.accent} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: colors.text3 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: colors.text3 }} axisLine={false} tickLine={false} reversed={chartType === "pace"} />
              <Tooltip content={<ChartTooltip type={chartType} />} />
              <Area
                type="monotone"
                dataKey={chartType}
                stroke={colors.accent}
                strokeWidth={2.5}
                fill="url(#accentGrad)"
                dot={{ r: 3, fill: colors.accent, stroke: colors.bg, strokeWidth: 2 }}
                activeDot={{ r: 5, fill: colors.accent, stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
