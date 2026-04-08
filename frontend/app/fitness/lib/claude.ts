// lib/claude.ts
// Claude API wrapper for the AI coaching agent
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

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

  // ── Split runs into ITD, YTD, MTD ──
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

  // Last 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekRuns = data.allRuns.filter((r) => new Date(r.date) >= weekAgo);

  // ── Helper stats ──
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
  const weekStats = calcStats(weekRuns);

  // ── Recent runs detail (last 10) ──
  const recentRuns = data.allRuns
    .slice(-10)
    .map(
      (r) =>
        `${r.date}: ${r.distanceKm}km in ${Math.floor(r.durationSec / 60)}m${r.durationSec % 60}s (pace: ${Math.floor(r.paceMinKm)}:${String(Math.round((r.paceMinKm % 1) * 60)).padStart(2, "0")}/km, speed: ${r.speedKmh}km/h)`
    )
    .join("\n");

  // ── Goals context ──
  const goalsText =
    data.goals.length > 0
      ? data.goals
          .map(
            (g) =>
              `- ${g.targetType}: target ${g.targetValue}${g.deadline ? ` by ${g.deadline}` : ""}`
          )
          .join("\n")
      : "No goals set.";

  // ── Build the prompt ──
  const systemPrompt = `You are RunPulse Coach, an expert AI running coach embedded in a fitness tracking app. You analyse the user's run data across three timeframes (ITD, YTD, MTD) and provide actionable, personalised coaching.

Your personality:
- Supportive but direct — like a good coach who pushes you
- Data-driven — always reference specific numbers from their data
- Practical — give concrete next-run recommendations
- Brief — keep each section to 2-3 sentences max

Always respond in this exact structure with these 6 sections using markdown headers:

## 📊 Quick summary
One-line snapshot of where they stand right now.

## 📈 Trend analysis
Compare YTD vs ITD pace/distance${includeMTD ? ", and MTD where available" : ""}. Are they improving? Slowing down? Highlight the most important trend.

## 🏃 This week
What they did in the last 7 days. Too much? Too little? Right balance?

## 🎯 Goal progress
How they're tracking against their goals. If no goals, suggest one based on their data.

## 💡 Coach's recommendation
One specific recommendation for their next run (exact distance + target pace). Plus one training tip.

## 🔮 Projection
If they keep this up, where will they be in 30 days? Project their monthly distance or pace improvement.`;

  const userMessage = `Analyse my running data. My name is ${data.userName}.

=== ITD (ALL TIME) ===
Runs: ${itdStats.count} | Total: ${itdStats.totalKm}km | Avg pace: ${itdStats.avgPace} min/km | Best pace: ${itdStats.bestPace} min/km | Longest: ${itdStats.longestRun}km

=== YTD (${currentYear}) ===
Runs: ${ytdStats.count} | Total: ${ytdStats.totalKm}km | Avg pace: ${ytdStats.avgPace} min/km | Best pace: ${ytdStats.bestPace} min/km | Longest: ${ytdStats.longestRun}km
${includeMTD ? `
=== MTD (${now.toLocaleString("en-US", { month: "long" })} ${currentYear}) ===
Runs: ${mtdStats.count} | Total: ${mtdStats.totalKm}km | Avg pace: ${mtdStats.avgPace} min/km | Best pace: ${mtdStats.bestPace} min/km | Longest: ${mtdStats.longestRun}km
` : `=== MTD ===
Not included — fewer than 10 days into the month (day ${dayOfMonth}). Only ITD and YTD are considered.`}

=== LAST 7 DAYS ===
Runs: ${weekStats.count} | Total: ${weekStats.totalKm}km | Avg pace: ${weekStats.avgPace} min/km

=== RECENT RUNS (last 10) ===
${recentRuns || "No runs logged yet."}

=== ACTIVE GOALS ===
${goalsText}

Today's date: ${now.toISOString().split("T")[0]}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  // Extract text from response
  const text = response.content
    .filter((block: any) => block.type === "text")
    .map((block: any) => block.text as string)
    .join("\n");

  return text;
}
