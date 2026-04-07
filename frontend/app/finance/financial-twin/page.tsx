'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
  AreaChart, Area,
} from 'recharts'

/* ── Types ─────────────────────────────────────────────── */
interface StressRow {
  score_date: string
  stress_score: number
  sustainability: number
  stress_band: string
  total_monthly_expenses: number
  financial_runway_months: number
  liability_to_asset_pct: number
}

interface BurndownRow {
  month_number: number
  year_number: number
  projection_date: string
  net_asset: number
  monthly_expense: number
  annual_expense: number
  inflation_rate: number
  months_to_zero: number
}

interface CompareRow {
  month_number: number
  scenario: string
  net_asset: number
  monthly_expense: number
  months_to_zero: number
}

/* ── Colors ─────────────────────────────────────────────── */
const BLUE    = '#2563EB'
const GREEN   = '#10B981'
const RED     = '#EF4444'
const AMBER   = '#F59E0B'
const PINK    = '#EC4899'
const MUTED   = '#64748B'
const BORDER  = '#E2E8F0'
const WHITE   = '#FFFFFF'
const BG      = '#F0F4FF'

/* ── Helpers ─────────────────────────────────────────────── */
function fmt(n: number) {
  const abs = Math.abs(n)
  if (abs >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`
  if (abs >= 100_000)    return `₹${(n / 100_000).toFixed(2)} L`
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function bandColor(band: string) {
  if (band === 'Low')      return GREEN
  if (band === 'Moderate') return AMBER
  if (band === 'High')     return RED
  return RED
}

/* ── Sub-components ─────────────────────────────────────── */
function KpiCard({ icon, label, value, accent, sub }: { icon: string; label: string; value: string; accent: string; sub?: string }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderTop: `3px solid ${accent}`, borderRadius: 14, padding: '1.2rem 1.3rem', boxShadow: '0 1px 6px rgba(37,99,235,0.07)' }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: `${accent}18`, border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', marginBottom: '0.8rem' }}>{icon}</div>
      <div style={{ fontSize: '0.56rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.17em', color: '#94A3B8', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.55rem', fontWeight: 800, color: accent, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.65rem', color: MUTED, marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '1.8rem 0 1rem' }}>
      <div style={{ width: 3, height: 14, borderRadius: 2, background: `linear-gradient(180deg,${BLUE},#3B82F6)`, flexShrink: 0 }} />
      <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: MUTED }}>{text}</span>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
    </div>
  )
}

function Card({ title, subtitle, badge, children }: { title: string; subtitle?: string; badge?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 8px rgba(37,99,235,0.06)' }}>
      <div style={{ padding: '0.9rem 1.3rem', borderBottom: `1px solid #F1F5F9`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E3A8A' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: 2 }}>{subtitle}</div>}
        </div>
        {badge && <span style={{ background: `${BLUE}12`, color: BLUE, fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '3px 9px', borderRadius: 20, border: `1px solid ${BLUE}25` }}>{badge}</span>}
      </div>
      <div style={{ padding: '1.2rem 1.3rem' }}>{children}</div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
      <div style={{ fontSize: '0.68rem', color: MUTED, marginBottom: 4 }}>Month {label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ fontSize: '0.82rem', fontWeight: 600, color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 10000 ? fmt(p.value) : p.value}
        </div>
      ))}
    </div>
  )
}

/* ── TAB 1: Stress Insight ───────────────────────────────── */
function StressInsight() {
  const [data, setData]       = useState<StressRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/finance/financial-twin?view=stress')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(setData).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: MUTED }}>Loading stress data…</div>
  if (error)   return <div style={{ background: '#FEF2F2', borderLeft: `3px solid ${RED}`, borderRadius: '0 8px 8px 0', padding: '1rem', color: '#991B1B' }}>❌ {error}</div>

  const latest   = data[0]
  const band     = latest?.stress_band ?? 'N/A'
  const bColor   = bandColor(band)
  const chartData = [...data].reverse().map((d, i) => ({
    month: i + 1,
    stress: d.stress_score,
    sustainability: d.sustainability,
  }))

  return (
    <>
      <SectionLabel text="Latest Stress Indicators" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: '0.5rem' }}>
        <KpiCard icon="🧠" label="Stress Score"        value={latest?.stress_score?.toFixed(2) ?? '—'}   accent={bColor}  sub={`Band: ${band}`} />
        <KpiCard icon="♻️" label="Sustainability"      value={`${latest?.sustainability?.toFixed(1)}%`}   accent={GREEN}   sub="Financial health" />
        <KpiCard icon="⏳" label="Financial Runway"    value={`${Math.round(latest?.financial_runway_months ?? 0)} mo`} accent={BLUE} sub={`~${(latest?.financial_runway_months / 12).toFixed(1)} years`} />
        <KpiCard icon="💸" label="Monthly Expenses"    value={fmt(latest?.total_monthly_expenses ?? 0)}   accent={AMBER}   />
        <KpiCard icon="📊" label="Liability/Asset %"   value={`${latest?.liability_to_asset_pct?.toFixed(2)}%`} accent={PINK} sub="Lower is better" />
      </div>

</>
  )
}

/* ── TAB 2: See Twin A ───────────────────────────────────── */
function TwinA() {
  const [data, setData]       = useState<BurndownRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/finance/financial-twin?view=twin-a')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(setData).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: MUTED }}>Loading Twin A projection…</div>
  if (error)   return <div style={{ background: '#FEF2F2', borderLeft: `3px solid ${RED}`, borderRadius: '0 8px 8px 0', padding: '1rem', color: '#991B1B' }}>❌ {error}</div>

  const first        = data[0]
  const chartData    = data.map(d => ({ month: Number(d.month_number), net_asset: d.net_asset, expense: d.monthly_expense }))

  return (
    <>
      <SectionLabel text="Twin A — With Liabilities" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: '0.5rem' }}>
        <KpiCard icon="💼" label="Starting Net Asset"  value={fmt(first?.net_asset ?? 0)}           accent={BLUE}  sub="After liabilities" />
        <KpiCard icon="📅" label="Months to Zero"       value={`${first?.months_to_zero ?? '—'} mo`} accent={RED}   sub={`~${((first?.months_to_zero ?? 0) / 12).toFixed(1)} years`} />
        <KpiCard icon="💸" label="Monthly Expense"      value={fmt(first?.monthly_expense ?? 0)}     accent={AMBER} />
        <KpiCard icon="📈" label="Annual Expense"       value={fmt(first?.annual_expense ?? 0)}      accent={PINK}  sub="Inflation adjusted" />
        <KpiCard icon="🔥" label="Inflation Rate"       value={`${((first?.inflation_rate ?? 0) * 100).toFixed(0)}%`} accent={GREEN} />
      </div>

      <SectionLabel text="Net Asset Burndown Projection" />
      <Card title="Twin A — Net Asset over Time" subtitle="With liabilities · TWIN_A scenario" badge="LIVE">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <defs>
              <linearGradient id="assetGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={BLUE} stopOpacity={0.15} />
                <stop offset="95%" stopColor={BLUE} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="month" tick={{ fill: MUTED, fontSize: 11 }} label={{ value: 'Month', position: 'insideBottom', offset: -4, fill: MUTED, fontSize: 11 }} />
            <YAxis tickFormatter={v => `${(v / 10_000_000).toFixed(1)}Cr`} tick={{ fill: MUTED, fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
            <Area type="monotone" dataKey="net_asset" stroke={BLUE} fill="url(#assetGrad)" strokeWidth={2} name="Net Asset (₹)" dot={false} />
            <Line type="monotone" dataKey="expense"   stroke={AMBER} strokeWidth={1.5} strokeDasharray="4 4" name="Monthly Expense (₹)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </>
  )
}

/* ── TAB 3: Twin A vs Twin B ─────────────────────────────── */
function TwinCompare() {
  const [data, setData]       = useState<CompareRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/finance/financial-twin?view=compare')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(setData).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: MUTED }}>Loading comparison…</div>
  if (error)   return <div style={{ background: '#FEF2F2', borderLeft: `3px solid ${RED}`, borderRadius: '0 8px 8px 0', padding: '1rem', color: '#991B1B' }}>❌ {error}</div>

  const twinA = data.filter(d => d.scenario === 'TWIN_A')
  const twinB = data.filter(d => d.scenario === 'TWIN_B')

  const maxMonths = Math.max(twinA.length, twinB.length)
  const chartData = Array.from({ length: maxMonths }, (_, i) => ({
    month:  i,
    twin_a: twinA[i]?.net_asset ?? null,
    twin_b: twinB[i]?.net_asset ?? null,
  }))

  const aFirst = twinA[0]; const bFirst = twinB[0]

  return (
    <>
      <SectionLabel text="Twin A vs Twin B — Key Differences" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: '0.5rem' }}>
        <Card title="🔵 Twin A — With Liabilities" subtitle="Current state including all debts">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <KpiCard icon="💼" label="Net Asset"      value={fmt(aFirst?.net_asset ?? 0)}     accent={BLUE} />
            <KpiCard icon="📅" label="Months to Zero" value={`${aFirst?.months_to_zero ?? '—'} mo`} accent={RED} sub={`${((aFirst?.months_to_zero ?? 0) / 12).toFixed(1)} yrs`} />
          </div>
        </Card>
        <Card title="🟢 Twin B — Zero Debt" subtitle="Hypothetical scenario with no liabilities">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <KpiCard icon="💼" label="Net Asset"      value={fmt(bFirst?.net_asset ?? 0)}     accent={GREEN} />
            <KpiCard icon="📅" label="Months to Zero" value={`${bFirst?.months_to_zero ?? '—'} mo`} accent={GREEN} sub={`${((bFirst?.months_to_zero ?? 0) / 12).toFixed(1)} yrs`} />
          </div>
        </Card>
      </div>

      <div style={{ background: `${BLUE}08`, border: `1px solid ${BLUE}20`, borderRadius: 12, padding: '12px 18px', marginBottom: '1rem', display: 'flex', gap: 24 }}>
        <div>
          <span style={{ fontSize: '0.65rem', color: MUTED, display: 'block', marginBottom: 2 }}>Extra runway by clearing debt</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: GREEN }}>
            +{((bFirst?.months_to_zero ?? 0) - (aFirst?.months_to_zero ?? 0))} months
          </span>
        </div>
        <div>
          <span style={{ fontSize: '0.65rem', color: MUTED, display: 'block', marginBottom: 2 }}>Additional net worth (debt-free)</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: BLUE }}>
            {fmt((bFirst?.net_asset ?? 0) - (aFirst?.net_asset ?? 0))}
          </span>
        </div>
      </div>

      <SectionLabel text="Burndown Comparison Chart" />
      <Card title="Twin A vs Twin B — Net Asset over Time" subtitle="Debt vs No-Debt scenario" badge="LIVE">
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <defs>
              <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={BLUE}  stopOpacity={0.15} />
                <stop offset="95%" stopColor={BLUE}  stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="bGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={GREEN} stopOpacity={0.15} />
                <stop offset="95%" stopColor={GREEN} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="month" tick={{ fill: MUTED, fontSize: 11 }} label={{ value: 'Month', position: 'insideBottom', offset: -4, fill: MUTED, fontSize: 11 }} />
            <YAxis tickFormatter={v => `${(v / 10_000_000).toFixed(1)}Cr`} tick={{ fill: MUTED, fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
            <Area type="monotone" dataKey="twin_a" stroke={BLUE}  fill="url(#aGrad)" strokeWidth={2} name="Twin A (With Debt)" dot={false} connectNulls />
            <Area type="monotone" dataKey="twin_b" stroke={GREEN} fill="url(#bGrad)" strokeWidth={2} name="Twin B (Zero Debt)" dot={false} connectNulls />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </>
  )
}

/* ── Main Page ───────────────────────────────────────────── */
const TABS = [
  { id: 'stress',  label: '🧠 Stress Insight',    component: StressInsight },
  { id: 'twin-a',  label: '📋 See Twin A',         component: TwinA },
  { id: 'compare', label: '⚖️ Twin A vs Twin B',   component: TwinCompare },
]

export default function FinancialTwinPage() {
  const [active, setActive] = useState('stress')

  const TabComponent = TABS.find(t => t.id === active)?.component ?? StressInsight

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Inter,sans-serif' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* ── Header ── */}
      <header style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/finance" style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: MUTED, textDecoration: 'none', flexShrink: 0 }}>←</Link>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, #059669, #10B981)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(5,150,105,0.25)' }}>🎯</div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A' }}>Financial Twin</div>
            <div style={{ fontSize: '0.6rem', color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginTop: 2 }}>Job Loss Stress Test · ft.stress_score · ft.burndown_results</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, animation: 'pulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: '0.6rem', color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Live · Neon PostgreSQL</span>
        </div>
      </header>

      {/* ── Tab Bar ── */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '0 2rem', display: 'flex', gap: 4 }}>
        <div style={{ fontSize: '0.65rem', color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', marginRight: 16 }}>
          Job Loss Stress Test · Select View
        </div>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            style={{
              padding: '14px 28px',
              border: 'none',
              borderBottom: active === tab.id ? `3px solid ${BLUE}` : '3px solid transparent',
              background: active === tab.id ? `${BLUE}08` : 'transparent',
              color: active === tab.id ? BLUE : MUTED,
              fontWeight: active === tab.id ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontFamily: 'Inter,sans-serif',
              borderRadius: '4px 4px 0 0',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap' as const,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '1rem 2rem 4rem' }}>
        <TabComponent />
      </main>
    </div>
  )
}
