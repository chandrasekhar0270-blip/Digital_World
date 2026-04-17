// lib/claude.ts
// Azure AI Foundry wrapper — OpenAI-compatible endpoint
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AZURE_AI_KEY!,
  baseURL: process.env.AZURE_AI_ENDPOINT!,
});

const MODEL = process.env.AZURE_AI_MODEL ?? "Phi-4-reasoning";

// ── interfaces stay identical ──
interface RunData {
  date: string;
  distanceKm: number;
  durationSec: number;
  speedKmh: number;
  paceMinKm: number;
}

interface GoalData {
  targetType: string;
  targetValue: number;
  deadline: string | null;
}

interface CoachRequest {
  allRuns: RunData[];
  goals: GoalData[];
  userName: string;
}

export async function getCoachingInsights(data: CoachRequest): Promise<string> {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const dayOfMonth = now.getDate();
  const includeMTD = dayOfMonth >= 10;

  const itdRuns = data.allRuns;
  const ytdRuns = data.allRuns.filter(
    (r) => new Date(r.date).getFullYear() === currentYear
  );
  const mtdRuns = includeMTD
    ? data.allRuns.filter((r) => {
        const d = new Date(r.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
    : [];

  const calcStats = (runs: RunData[]) => {
    if (runs.length === 0)
      return { count: 0, totalKm: 0, avgPace: 0, avgSpeed: 0, bestPace: 0, longestRun: 0 };
    const totalKm = runs.reduce((s, r) => s + r.distanceKm, 0);
    const totalSec = runs.reduce((s, r) => s + r.durationSec, 0);
    return {
      count: runs.length,
      totalKm: Math.round(totalKm * 10) / 10,
      avgPace: Math.round((totalSec / 60 / totalKm) * 100) / 100,
      avgSpeed: Math.round((totalKm / (totalSec / 3600)) * 10) / 10,
      bestPace: Math.round(Math.min(...runs.map((r) => r.paceMinKm)) * 100) / 100,
      longestRun: Math.round(Math.max(...runs.map((r) => r.distanceKm)) * 10) / 10,
    };
  };

  const itdStats = calcStats(itdRuns);
  const ytdStats = calcStats(ytdRuns);
  const mtdStats = calcStats(mtdRuns);

  const goalsText =
    data.goals.length > 0
      ? data.goals
          .map(
            (g) =>
              `- ${g.targetType}: target ${g.targetValue}${g.deadline ? ` by ${g.deadline}` : ""}`
          )
          .join("\n")
      : "No goals set.";

  const systemPrompt = `You are RunPulse Coach, an expert AI running coach inside a fitness app. Your job is to analyse the runner's data and give sharp, personalised coaching.

STRICT RULES — follow exactly:
1. NEVER add preamble, intro, or closing remarks outside the 5 sections.
2. Output ONLY the 5 markdown sections below — nothing before, nothing after.
3. Each section: 2-3 sentences max. Be direct. Reference actual numbers from the data.
4. Do NOT repeat the section instruction text — just write the content.

Respond in exactly this structure:

## 📊 Quick summary
One punchy sentence on where they stand right now — total distance, pace, highlight.

## 📈 Trend analysis
Compare MTD vs YTD vs ITD pace and volume. Are they improving or stalling? Name the key trend.

## 🎯 Goal progress
Track against goals. If no goals set, suggest one specific goal based on their current level.

## 💡 Coach's recommendation
One precise next-run prescription: exact distance + target pace. Add one actionable training tip.

## 🔮 Projection
Based on MTD consistency, where will they be by end of month and end of year? Give specific numbers.`;

  const userMessage = `Analyse my running data. My name is ${data.userName}.

=== MTD (${now.toLocaleString("en-US", { month: "long" })} ${currentYear}) ===
Runs: ${mtdStats.count} | Total: ${mtdStats.totalKm}km | Avg pace: ${mtdStats.avgPace} min/km | Best pace: ${mtdStats.bestPace} min/km | Longest: ${mtdStats.longestRun}km

=== YTD (${currentYear}) ===
Runs: ${ytdStats.count} | Total: ${ytdStats.totalKm}km | Avg pace: ${ytdStats.avgPace} min/km | Best pace: ${ytdStats.bestPace} min/km | Longest: ${ytdStats.longestRun}km

=== ITD (ALL TIME) ===
Runs: ${itdStats.count} | Total: ${itdStats.totalKm}km | Avg pace: ${itdStats.avgPace} min/km | Best pace: ${itdStats.bestPace} min/km | Longest: ${itdStats.longestRun}km

=== ACTIVE GOALS ===
${goalsText}

Today's date: ${now.toISOString().split("T")[0]}`;

  // ── Call Azure AI Foundry (OpenAI-compatible) ──
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 8000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });

  const raw = response.choices[0].message.content ?? "";

  // Phi-4-reasoning emits <think>...</think> blocks before its actual answer.
  // The think block can be very long; handle both closed and unclosed cases.
  let cleaned: string;
  const thinkEnd = raw.lastIndexOf("</think>");
  if (thinkEnd !== -1) {
    // Closed block — take everything after it
    cleaned = raw.slice(thinkEnd + "</think>".length).trim();
  } else if (raw.includes("<think>")) {
    // Unclosed block — the model ran out of tokens inside the think block;
    // nothing useful to return, so signal the caller to retry or report the issue.
    cleaned = "";
  } else {
    cleaned = raw.trim();
  }

  if (!cleaned) {
    throw new Error(
      "Model returned only internal reasoning. Try again or increase max_tokens."
    );
  }

  return cleaned;
}
