'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts'

interface ScorecardData {
  category: string
  amount: number
  formatted_amount: string
}

const BLUE     = '#2563EB'
const GREEN    = '#10B981'
const RED      = '#EF4444'
const AMBER    = '#F59E0B'
const MUTED    = '#64748B'
const BORDER   = '#E2E8F0'
const WHITE    = '#FFFFFF'
const BG       = '#F0F4FF'

const CAT_COLOR: Record<string, string> = {
  Assets:      BLUE,
  Liabilities: RED,
  'Net Worth': GREEN,
}

function fmt(n: number) {
  const abs = Math.abs(n)
  if (abs >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`
  if (abs >= 100_000)    return `₹${(n / 100_000).toFixed(2)} L`
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
      <div style={{ fontSize: '0.7rem', color: MUTED, marginBottom: 2 }}>{p.payload?.name || p.name}</div>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: p.payload?.fill || BLUE }}>
        {p.payload?.formatted_amount || fmt(p.value)}
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, sub, accent, delay }: { icon: string; label: string; value: string; sub: string; accent: string; delay: number }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderTop: `3px solid ${accent}`, borderRadius: 14, padding: '1.2rem 1.3rem', boxShadow: '0 1px 6px rgba(37,99,235,0.07)', animation: `fadeUp 0.4s ease ${delay}ms both` }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: `${accent}18`, border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', marginBottom: '0.8rem' }}>{icon}</div>
      <div style={{ fontSize: '0.56rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.17em', color: '#94A3B8', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: accent, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.65rem', color: MUTED, marginTop: 6 }}>{sub}</div>
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
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 8px rgba(37,99,235,0.06)', animation: 'fadeUp 0.4s ease both' }}>
      <div style={{ padding: '0.95rem 1.3rem 0.8rem', borderBottom: `1px solid #F1F5F9`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E3A8A' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: 2 }}>{subtitle}</div>}
        </div>
        {badge && <span style={{ background: `${BLUE}18`, color: BLUE, fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '3px 9px', borderRadius: 20, border: `1px solid ${BLUE}28` }}>{badge}</span>}
      </div>
      <div style={{ padding: '1.5rem' }}>{children}</div>
    </div>
  )
}

export default function NetAssetScoreboard() {
  const [data, setData]       = useState<ScorecardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/finance/Scorecard')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: MUTED, fontFamily: 'Inter,sans-serif' }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${BORDER}`, borderTopColor: BLUE, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <p>Loading scorecard…</p>
    </div>
  )

  if (error) return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Inter,sans-serif', padding: '2rem' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderLeft: `3px solid ${RED}`, borderRadius: '0 12px 12px 0', color: '#991B1B', padding: '1rem 1.5rem' }}>❌ {error}</div>
    </div>
  )

  const assetsRow      = data.find(d => d.category === 'Assets')
  const liabRow        = data.find(d => d.category === 'Liabilities')
  const netWorthRow    = data.find(d => d.category === 'Net Worth')

  const assetsVal      = assetsRow?.amount      ?? 0
  const liabVal        = liabRow?.amount        ?? 0
  const netWorthVal    = netWorthRow?.amount     ?? 0

  const debtRatio      = assetsVal > 0 ? ((liabVal / assetsVal) * 100).toFixed(1) : '0'
  const equityRatio    = assetsVal > 0 ? ((netWorthVal / assetsVal) * 100).toFixed(1) : '0'
  const liabCover      = liabVal > 0 ? (assetsVal / liabVal).toFixed(2) : '∞'

  const barData = data.map(d => ({ ...d, fill: CAT_COLOR[d.category] || BLUE }))
  const pieData = [
    { name: 'Liabilities', value: liabVal,           fill: RED },
    { name: 'Net Worth',   value: Math.max(netWorthVal, 0), fill: GREEN },
  ]

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Inter,sans-serif' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* ── Header ── */}
      <header style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/finance" style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: MUTED, textDecoration: 'none', flexShrink: 0 }}>←</Link>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, #9333EA, #A855F7)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(147,51,234,0.25)' }}>💼</div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A' }}>Net Asset Scoreboard</div>
            <div style={{ fontSize: '0.6rem', color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginTop: 2 }}>ft.net_worth_summary · Neon PostgreSQL</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, animation: 'pulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: '0.6rem', color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Live</span>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 2rem 4rem' }}>

        {/* ── KPI Cards ── */}
        <SectionLabel text="Financial Position" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: '0.5rem' }}>
          <KpiCard icon="📈" label="Total Assets"      value={assetsRow?.formatted_amount  ?? fmt(assetsVal)}   sub="Full asset base"          accent={BLUE}  delay={0}   />
          <KpiCard icon="📉" label="Total Liabilities" value={liabRow?.formatted_amount    ?? fmt(liabVal)}     sub={`${debtRatio}% of assets`} accent={RED}   delay={60}  />
          <KpiCard icon="💎" label="Net Worth"         value={netWorthRow?.formatted_amount ?? fmt(netWorthVal)} sub={`${equityRatio}% equity`} accent={GREEN} delay={120} />
          <KpiCard icon="🛡️" label="Asset Coverage"   value={`${liabCover}×`}                                   sub="assets ÷ liabilities"     accent={AMBER} delay={180} />
        </div>

        {/* ── Charts ── */}
        <SectionLabel text="Portfolio Composition" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: '0.5rem' }}>

          <Card title="Assets · Liabilities · Net Worth" badge="LIVE">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                <XAxis dataKey="category" tick={{ fill: MUTED, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${(v / 10_000_000).toFixed(1)}Cr`} tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={60}>
                  {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Equity vs Liability Split" subtitle="net worth composition">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={4} dataKey="value" stroke={WHITE} strokeWidth={3}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.fill }} />
                  <span style={{ fontSize: '0.75rem', color: MUTED }}>{d.name}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: d.fill }}>{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Summary Table ── */}
        <SectionLabel text="Scorecard Detail" />
        <Card title="Net Worth Summary" subtitle="ft.net_worth_summary · all rows" badge="LIVE">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFF' }}>
                {['Category', 'Amount', 'Formatted'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.1em', borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i} style={{ borderBottom: `1px solid #F1F5F9` }}>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontWeight: 700, color: CAT_COLOR[d.category] || MUTED }}>{d.category}</span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#1E293B', fontWeight: 600 }}>{fmt(d.amount)}</td>
                  <td style={{ padding: '12px 14px', color: MUTED }}>{d.formatted_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

      </main>
    </div>
  )
}
