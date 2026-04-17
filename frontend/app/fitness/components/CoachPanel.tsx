// components/CoachPanel.tsx
"use client";

import { useState } from "react";
import { colors, fonts } from "../lib/styles";

interface CoachPanelProps {
  hasRuns: boolean;
}

// Inline bold/italic parser
function parseInline(line: string, key: number): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = boldRegex.exec(line)) !== null) {
    if (match.index > lastIndex) parts.push(line.slice(lastIndex, match.index));
    parts.push(
      <span key={`b-${key}-${match.index}`} style={{ fontWeight: 700, color: colors.accent }}>
        {match[1]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) parts.push(line.slice(lastIndex));
  return parts;
}

// Markdown-to-JSX renderer
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;
  let sectionCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ## Section header
    if (line.startsWith("## ")) {
      if (sectionCount > 0) {
        elements.push(
          <div key={key++} style={{ height: 1, background: colors.border, margin: "16px 0" }} />
        );
      }
      sectionCount++;
      elements.push(
        <div
          key={key++}
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 8,
            fontFamily: fonts.sans,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {line.replace("## ", "")}
        </div>
      );
      continue;
    }

    // Empty line — skip
    if (line.trim() === "") continue;

    const inlineParts = parseInline(line, key);

    // Bullet point
    if (line.startsWith("- ") || line.startsWith("• ")) {
      const content = parseInline(line.slice(2), key);
      elements.push(
        <div
          key={key++}
          style={{
            fontSize: 13,
            color: colors.text2,
            lineHeight: 1.65,
            paddingLeft: 18,
            marginBottom: 5,
            fontFamily: fonts.sans,
            position: "relative",
          }}
        >
          <span style={{ position: "absolute", left: 0, color: colors.accent, fontWeight: 700 }}>•</span>
          {content}
        </div>
      );
      continue;
    }

    // Numbered list (1. 2. etc.)
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      const content = parseInline(numberedMatch[2], key);
      elements.push(
        <div
          key={key++}
          style={{
            fontSize: 13,
            color: colors.text2,
            lineHeight: 1.65,
            paddingLeft: 22,
            marginBottom: 5,
            fontFamily: fonts.sans,
            position: "relative",
          }}
        >
          <span style={{ position: "absolute", left: 0, color: colors.accent, fontWeight: 700 }}>
            {numberedMatch[1]}.
          </span>
          {content}
        </div>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <div
        key={key++}
        style={{
          fontSize: 13,
          color: colors.text2,
          lineHeight: 1.75,
          marginBottom: 6,
          fontFamily: fonts.sans,
        }}
      >
        {inlineParts}
      </div>
    );
  }

  return elements;
}

export function CoachPanel({ hasRuns }: CoachPanelProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const handleAnalyse = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/fitness/coach", { method: "POST" });

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error("Coach is busy — please try again in a moment.");
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to get coaching insights");
      }

      setInsights(data.insights);
      setGeneratedAt(data.generatedAt);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // No runs yet
  if (!hasRuns) {
    return (
      <div
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 20,
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginBottom: 6 }}>
          Your AI coach is ready
        </div>
        <div style={{ fontSize: 13, color: colors.text3 }}>
          Log at least one run to get personalised coaching insights
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Analyse button */}
      {!loading && (
        <button
          onClick={handleAnalyse}
          style={{
            width: "100%",
            padding: 16,
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: fonts.sans,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow: `0 4px 20px ${colors.accent}40`,
            transition: "all 0.3s",
          }}
        >
          <span style={{ fontSize: 20 }}>🤖</span>
          {insights ? "Refresh analysis" : "Analyse my runs"}
        </button>
      )}

      {/* Loading state */}
      {loading && (
        <div
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 20,
            padding: "40px 24px",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: `3px solid ${colors.border}`,
              borderTop: `3px solid ${colors.accent}`,
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 1s linear infinite",
            }}
          />
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 4 }}>
            Analysing your runs...
          </div>
          <div style={{ fontSize: 12, color: colors.text3 }}>
            Reviewing ITD, YTD, and MTD data
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          style={{
            background: "rgba(244,67,54,0.15)",
            border: "1px solid rgba(244,67,54,0.3)",
            borderRadius: 14,
            padding: "14px 18px",
            marginBottom: 16,
            fontSize: 13,
            color: "#ef5350",
            fontFamily: fonts.sans,
          }}
        >
          {error}
        </div>
      )}

      {/* Insights display */}
      {insights && !loading && (
        <div
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 20,
            padding: 24,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              paddingBottom: 14,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: colors.accentGlow,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                🤖
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
                  RunPulse Coach
                </div>
                <div style={{ fontSize: 11, color: colors.text3 }}>
                  AI-powered analysis
                </div>
              </div>
            </div>
            {generatedAt && (
              <div style={{ fontSize: 10, color: colors.text3 }}>
                {new Date(generatedAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}
          </div>

          {/* Rendered insights */}
          <div>{renderMarkdown(insights)}</div>

          {/* Data source badge */}
          <div
            style={{
              marginTop: 20,
              paddingTop: 14,
              borderTop: `1px solid ${colors.border}`,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {["ITD", "YTD", "MTD"].map((label) => (
              <span
                key={label}
                style={{
                  fontSize: 10,
                  color: colors.accent,
                  background: colors.accentGlow,
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  fontFamily: fonts.mono,
                }}
              >
                {label}
              </span>
            ))}
            <span
              style={{
                fontSize: 10,
                color: colors.text3,
                padding: "4px 0",
              }}
            >
              data analysed
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
