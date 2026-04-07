'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

interface CostRow {
  id: number
  category: string
  particulars: string
  amount: number
}

const BLUE    = '#2563EB'
const AMBER   = '#F59E0B'
const RED     = '#EF4444'
const GREEN   = '#10B981'
const PURPLE  = '#8B5CF6'
const MUTED   = '#64748B'
const BORDER  = '#E2E8F0'
const BG      = '#F8FAFF'
const WHITE   = '#FFFFFF'

const CAT_COLORS: Record<string, string> = {
  'Purchase Cost': BLUE,
  'Interest':      RED,
  'Sale':          GREEN,
}

const PART_COLORS = [BLUE, '#3B82F6', '#0EA5E9', AMBER, '#F97316', PURPLE, '#6366F1', GREEN]

function fmt(n: number) {
  const abs = Math.abs(n)
  if (abs >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`
  if (abs >= 100_000)    return `₹${(n / 100_000).toFixed(2)} L`
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
      <div style={{ fontSize: '0.7rem', color: MUTED, marginBottom: 2 }}>{payload[0].name}</div>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: BLUE }}>{fmt(payload[0].value)}</div>
    </div>
  )
}

function KpiCard({ icon, label, value, accent, sub }: { icon: string; label: string; value: string; accent: string; sub?: string }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderTop: `3px solid ${accent}`, borderRadius: 14, padding: '1.2rem 1.3rem', boxShadow: '0 1px 6px rgba(37,99,235,0.06)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: `${accent}18`, border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', marginBottom: '0.75rem' }}>{icon}</div>
      <div style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#94A3B8', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: accent, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.65rem', color: MUTED, marginTop: 5 }}>{sub}</div>}
    </div>
  )
}

function Card({ title, subtitle, badge, children }: { title: string; subtitle?: string; badge?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 8px rgba(37,99,235,0.05)' }}>
      <div style={{ padding: '0.9rem 1.3rem', borderBottom: `1px solid #F1F5F9`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E3A8A' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: 2 }}>{subtitle}</div>}
        </div>
        {badge && <span style={{ background: `${BLUE}12`, color: BLUE, fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20, border: `1px solid ${BLUE}25` }}>{badge}</span>}
      </div>
      <div style={{ padding: '1.2rem 1.3rem' }}>{children}</div>
    </div>
  )
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '1.8rem 0 1rem' }}>
      <div style={{ width: 3, height: 14, borderRadius: 2, background: `linear-gradient(180deg, ${BLUE}, #3B82F6)`, flexShrink: 0 }} />
      <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: MUTED }}>{text}</span>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
    </div>
  )
}

function TableRow({ particulars, amount, color, pct }: { particulars: string; amount: number; color: string; pct: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 4px', borderBottom: `1px solid #F1F5F9` }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: '0.84rem', color: '#1E293B', fontWeight: 500 }}>{particulars}</div>
      <div style={{ width: 80, background: '#F1F5F9', borderRadius: 3, height: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
      <div style={{ fontSize: '0.78rem', fontWeight: 600, color, minWidth: 90, textAlign: 'right' }}>{fmt(amount)}</div>
    </div>
  )
}

export default function RealEstatePage() {
  const [rows, setRows] = useState<CostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/finance/real-estate')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => setRows(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: MUTED, fontFamily: 'Inter,sans-serif' }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${BORDER}`, borderTopColor: BLUE, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p>Loading Real Estate data…</p>
    </div>
  )

  if (error) return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Inter,sans-serif', padding: '2rem' }}>
      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderLeft: `3px solid ${RED}`, borderRadius: '0 12px 12px 0', color: '#991B1B', padding: '1rem 1.5rem' }}>❌ {error}</div>
    </div>
  )

  // ── Derived values ──────────────────────────────────────────
  const saleValue      = rows.filter(r => r.category === 'Sale').reduce((s, r) => s + r.amount, 0)
  const purchaseCost   = rows.filter(r => r.category === 'Purchase Cost').reduce((s, r) => s + r.amount, 0)
  const interestCost   = rows.filter(r => r.category === 'Interest').reduce((s, r) => s + r.amount, 0)
  const totalPayable   = purchaseCost + interestCost
  const equity         = rows.find(r => r.particulars === 'Down Payment')?.amount ?? 0
  const loanAmount     = rows.find(r => r.particulars === 'Bank Loan')?.amount ?? 0
  const netGainLoss    = saleValue - totalPayable

  const byCategory = Object.entries(
    rows.reduce((acc, r) => { acc[r.category] = (acc[r.category] || 0) + r.amount; return acc }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  const purchaseRows = rows.filter(r => r.category === 'Purchase Cost')
  const purchaseTotal = purchaseRows.reduce((s, r) => s + r.amount, 0)

  const interestRows = rows.filter(r => r.category === 'Interest')
  const interestTotal = interestRows.reduce((s, r) => s + r.amount, 0)

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Inter,sans-serif' }}>

      {/* ── Header ── */}
      <header style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/finance" style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: MUTED, textDecoration: 'none', flexShrink: 0 }}>←</Link>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, #DC2626, #EF4444)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(220,38,38,0.25)' }}>🏠</div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A' }}>Real Estate Cost Analysis</div>
            <div style={{ fontSize: '0.6rem', color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2 }}>ft.cost_of_investment · Neon PostgreSQL</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, animation: 'pulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: '0.6rem', color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Live</span>
        </div>
      </header>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 2rem 4rem' }}>

        {/* ── KPI Row ── */}
        <SectionLabel text="Property Overview" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: '0.5rem' }}>
          <KpiCard icon="🏷️" label="Sale Deed Value"   value={fmt(saleValue)}    accent={GREEN}  sub="Registered sale price" />
          <KpiCard icon="💳" label="Purchase Cost"     value={fmt(purchaseCost)} accent={BLUE}   sub="Down payment + charges" />
          <KpiCard icon="📈" label="Interest Paid"     value={fmt(interestCost)} accent={AMBER}  sub="SBI + Tata Capital loans" />
          <KpiCard icon="🏦" label="Bank Loan"         value={fmt(loanAmount)}   accent={PURPLE} sub="Total loan borrowed" />
          <KpiCard
            icon={netGainLoss >= 0 ? '✅' : '⚠️'}
            label="Net Gain / Loss"
            value={`${netGainLoss >= 0 ? '+' : ''}${fmt(netGainLoss)}`}
            accent={netGainLoss >= 0 ? GREEN : RED}
            sub="Sale − Total Payable"
          />
        </div>

        {/* ── Loan vs Equity ── */}
        <SectionLabel text="Funding Structure" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: '0.5rem' }}>

          <Card title="Loan vs Equity Split" badge="LIVE">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Bank Loan', value: loanAmount },
                    { name: 'Equity / Down Payment', value: equity },
                  ]}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                  paddingAngle={4} dataKey="value" stroke={WHITE} strokeWidth={3}
                >
                  <Cell fill={BLUE} />
                  <Cell fill={AMBER} />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
              {[{ label: 'Bank Loan', color: BLUE, val: loanAmount }, { label: 'Equity', color: AMBER, val: equity }].map(i => (
                <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: i.color }} />
                  <span style={{ fontSize: '0.75rem', color: MUTED }}>{i.label}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: i.color }}>{fmt(i.val)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Cost by Category" badge="LIVE">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byCategory} margin={{ top: 8, right: 20, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${(v/100000).toFixed(0)}L`} tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {byCategory.map((r, i) => <Cell key={i} fill={CAT_COLORS[r.name] || BLUE} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ── Purchase Cost Breakdown ── */}
        <SectionLabel text="Purchase Cost Breakdown" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: '0.5rem' }}>
          <Card title="Purchase Items" subtitle="all purchase cost line items">
            <div>
              {purchaseRows.map((r, i) => (
                <TableRow key={r.id} particulars={r.particulars} amount={r.amount} color={PART_COLORS[i % PART_COLORS.length]} pct={(r.amount / purchaseTotal) * 100} />
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: BLUE }}>Total: {fmt(purchaseTotal)}</span>
              </div>
            </div>
          </Card>

          <Card title="Interest Breakdown" subtitle="loan interest by lender">
            <div>
              {interestRows.map((r, i) => (
                <TableRow key={r.id} particulars={r.particulars} amount={r.amount} color={[RED, AMBER, PURPLE][i % 3]} pct={(r.amount / interestTotal) * 100} />
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: RED }}>Total: {fmt(interestTotal)}</span>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: '12px 14px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10 }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Interest as % of Sale Value</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#B45309' }}>
                {((interestTotal / saleValue) * 100).toFixed(1)}%
              </div>
            </div>
          </Card>
        </div>

        {/* ── Cost vs Sale Summary ── */}
        <SectionLabel text="Cost vs Sale Summary" />
        <Card title="Total Cost vs Sale Value" badge="LIVE">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={[
                { name: 'Sale Value', value: saleValue, fill: GREEN },
                { name: 'Purchase Cost', value: purchaseCost, fill: BLUE },
                { name: 'Interest Paid', value: interestCost, fill: RED },
                { name: 'Total Payable', value: totalPayable, fill: AMBER },
              ]}
              margin={{ top: 8, right: 30, bottom: 8, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `${(v/100000).toFixed(0)}L`} tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6,6,0,0]} barSize={50}>
                {[GREEN, BLUE, RED, AMBER].map((c, i) => <Cell key={i} fill={c} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

      </main>
    </div>
  )
}
