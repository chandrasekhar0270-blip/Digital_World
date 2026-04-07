'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Asset {
  id: number
  description: string
  category: string
  quantity: string
  value: string | null
  units: string | null
  interest: string | null
}

const BLUE   = '#2563EB'
const GREEN  = '#10B981'
const AMBER  = '#F59E0B'
const PURPLE = '#8B5CF6'
const MUTED  = '#64748B'
const BORDER = '#E2E8F0'
const WHITE  = '#FFFFFF'
const BG     = '#F8FAFF'
const COLORS = [BLUE, '#3B82F6', '#0EA5E9', AMBER, PURPLE, GREEN, '#F97316', '#6366F1']

function parseAmount(val: string | null): number {
  if (!val) return 0
  return parseFloat(val.replace(/,/g, '')) || 0
}

function fmt(n: number) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(2)} L`
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
      <div style={{ fontSize: '0.7rem', color: MUTED, marginBottom: 2 }}>{payload[0].name || payload[0].payload?.description}</div>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: BLUE }}>{fmt(payload[0].value)}</div>
    </div>
  )
}

function KpiCard({ icon, label, value, accent, sub }: { icon: string; label: string; value: string; accent: string; sub?: string }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderTop: `3px solid ${accent}`, borderRadius: 14, padding: '1.2rem 1.3rem', boxShadow: '0 1px 6px rgba(37,99,235,0.06)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: `${accent}18`, border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', marginBottom: '0.75rem' }}>{icon}</div>
      <div style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.16em', color: '#94A3B8', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: accent, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.65rem', color: MUTED, marginTop: 5 }}>{sub}</div>}
    </div>
  )
}

export default function AssetValuationPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/finance/asset-valuation')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => setAssets(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: MUTED, fontFamily: 'Inter,sans-serif' }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${BORDER}`, borderTopColor: BLUE, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p>Loading asset data…</p>
    </div>
  )

  if (error) return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Inter,sans-serif', padding: '2rem' }}>
      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderLeft: `3px solid #EF4444`, borderRadius: '0 12px 12px 0', color: '#991B1B', padding: '1rem 1.5rem' }}>❌ {error}</div>
    </div>
  )

  const totalPortfolio = assets.reduce((s, a) => s + parseAmount(a.quantity), 0)
  const realEstate     = assets.filter(a => a.units === 'sqft')
  const financial      = assets.filter(a => !a.units)

  const chartData = financial.map(a => ({ description: a.description, value: parseAmount(a.quantity) }))

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Inter,sans-serif' }}>
      {/* Header */}
      <header style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/finance/real-estate" style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: MUTED, textDecoration: 'none' }}>←</Link>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${BLUE}, #3B82F6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', boxShadow: `0 2px 8px rgba(37,99,235,0.25)` }}>📊</div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A' }}>Asset Valuation</div>
            <div style={{ fontSize: '0.6rem', color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginTop: 2 }}>ft.assets_liabilities · Neon PostgreSQL</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, animation: 'pulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: '0.6rem', color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Live</span>
        </div>
      </header>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 2rem 4rem' }}>

        {/* KPIs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '1.5rem 0 1rem' }}>
          <div style={{ width: 3, height: 14, borderRadius: 2, background: `linear-gradient(180deg,${BLUE},#3B82F6)` }} />
          <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: MUTED }}>Portfolio Overview</span>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: '1.5rem' }}>
          <KpiCard icon="💼" label="Total Portfolio"   value={fmt(totalPortfolio)} accent={BLUE}   sub={`${assets.length} assets tracked`} />
          <KpiCard icon="🏠" label="Real Estate"       value={`${realEstate.length} properties`}   accent={AMBER}  sub="sqft-based assets" />
          <KpiCard icon="💰" label="Financial Assets"  value={`${financial.length} holdings`}       accent={GREEN}  sub="FD, MF, equity, PPF…" />
          <KpiCard icon="📈" label="Largest Holding"   value={financial.length ? financial.reduce((m, a) => parseAmount(a.quantity) > parseAmount(m.quantity) ? a : m).description : '—'} accent={PURPLE} sub="by value" />
        </div>

        {/* Real Estate Properties */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '1.5rem 0 1rem' }}>
          <div style={{ width: 3, height: 14, borderRadius: 2, background: `linear-gradient(180deg,${AMBER},#F97316)` }} />
          <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: MUTED }}>Real Estate Properties</span>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: '1.5rem' }}>
          {realEstate.map((a, i) => {
            const sqft = parseAmount(a.quantity)
            const ratePerSqft = a.value ? parseFloat(a.value) : 0
            const totalVal = sqft * ratePerSqft
            return (
              <div key={a.id} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderLeft: `4px solid ${COLORS[i % COLORS.length]}`, borderRadius: 14, padding: '1.2rem 1.3rem', boxShadow: '0 1px 6px rgba(37,99,235,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: `${COLORS[i % COLORS.length]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🏗️</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>{a.description}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: '#F8FAFF', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: 3 }}>Area</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: BLUE }}>{sqft.toLocaleString('en-IN')} sqft</div>
                  </div>
                  <div style={{ background: '#F8FAFF', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: 3 }}>Rate / sqft</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: AMBER }}>₹{ratePerSqft.toLocaleString('en-IN')}</div>
                  </div>
                </div>
                {totalVal > 0 && (
                  <div style={{ marginTop: 10, background: `${GREEN}10`, border: `1px solid ${GREEN}25`, borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: 3 }}>Estimated Value</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: GREEN }}>{fmt(totalVal)}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Financial Assets Chart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '1.5rem 0 1rem' }}>
          <div style={{ width: 3, height: 14, borderRadius: 2, background: `linear-gradient(180deg,${GREEN},#34D399)` }} />
          <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: MUTED }}>Financial Assets Portfolio</span>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 8px rgba(37,99,235,0.05)' }}>
          <div style={{ padding: '0.9rem 1.3rem', borderBottom: `1px solid #F1F5F9`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E3A8A' }}>Asset Breakdown by Value</div>
            <span style={{ background: `${BLUE}12`, color: BLUE, fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '3px 9px', borderRadius: 20, border: `1px solid ${BLUE}25` }}>LIVE</span>
          </div>
          <div style={{ padding: '1.2rem 1.3rem' }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 60, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
                <XAxis type="number" tickFormatter={v => `${(v/100000).toFixed(0)}L`} tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="description" width={150} tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </main>
    </div>
  )
}
