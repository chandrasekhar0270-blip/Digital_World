'use client'

import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import styles from './credit-debit.module.css'

/* ─── Types ─── */
interface FlowRow {
  type: string
  total: number
}

interface CategoryRow {
  item: string
  total: number
}

/* ─── Color Tokens ─── */
const BLUE = '#2563EB'
const BLUE_LT = '#3B82F6'
const CYAN = '#0EA5E9'
const POSITIVE = '#10B981'
const NEGATIVE = '#EF4444'
const MUTED = '#64748B'
const BLUE_SEQ = [BLUE, BLUE_LT, CYAN, '#6366F1', '#8B5CF6', '#0EA5E9']
const CHART_COLORS: Record<string, string> = { Credit: BLUE, Debit: NEGATIVE }

/* ─── Helpers ─── */
function formatINR(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`
  if (abs >= 100_000) return `₹${(amount / 100_000).toFixed(2)} L`
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

/* ─── Subcomponents ─── */
function KpiCard({
  icon, label, value, accent,
}: {
  icon: string; label: string; value: string; accent: string
}) {
  return (
    <div className={styles.kpiCard} style={{ borderTopColor: accent }}>
      <div className={styles.kpiIcon} style={{ background: `${accent}18`, borderColor: `${accent}25` }}>
        {icon}
      </div>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue} style={{ color: accent }}>{value}</div>
    </div>
  )
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div className={styles.sectionLabel}>
      <div className={styles.sectionBar} />
      <span className={styles.sectionText}>{text}</span>
      <div className={styles.sectionLine} />
    </div>
  )
}

function CardWrapper({
  title, subtitle, badge, children,
}: {
  title: string; subtitle?: string; badge?: string; children: React.ReactNode
}) {
  return (
    <div className={styles.card}>
      {title && (
        <div className={styles.cardHeader}>
          <div>
            <div className={styles.cardTitle}>{title}</div>
            {subtitle && <div className={styles.cardSubtitle}>{subtitle}</div>}
          </div>
          {badge && <span className={styles.badge}>{badge}</span>}
        </div>
      )}
      <div className={styles.cardBody}>{children}</div>
    </div>
  )
}

function FlowSummaryRow({ label, total, grand, color }: {
  label: string; total: number; grand: number; color: string
}) {
  const pct = grand > 0 ? (total / grand) * 100 : 0
  return (
    <div className={styles.flowRow}>
      <div className={styles.flowDot} style={{ background: color }} />
      <div className={styles.flowLabel}>{label}</div>
      <div className={styles.flowBarTrack}>
        <div className={styles.flowBarFill} style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className={styles.flowAmount} style={{ color }}>{formatINR(total)}</div>
      <div className={styles.flowPct}>{pct.toFixed(1)}%</div>
    </div>
  )
}

/* ─── Custom Tooltip ─── */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const data = payload[0]
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{data.name}</div>
      <div className={styles.tooltipValue}>{formatINR(data.value)}</div>
    </div>
  )
}

/* ─── Main Page ─── */
export default function CreditDebitPage() {
  const [summary, setSummary] = useState<FlowRow[]>([])
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [selectedType, setSelectedType] = useState<'Credit' | 'Debit'>('Credit')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch summary on mount
  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/finance/income-flow?view=summary')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        setSummary(json.data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  // Fetch category breakdown when selectedType changes
  useEffect(() => {
    async function fetchBreakdown() {
      try {
        const res = await fetch(
          `/api/finance/income-flow?view=breakdown&type=${selectedType}`
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        setCategories(json.data || [])
      } catch (err: any) {
        console.error('Breakdown fetch error:', err)
        setCategories([])
      }
    }
    fetchBreakdown()
  }, [selectedType])

  // Derived values
  const totalCredit = summary.find((r) => r.type === 'Credit')?.total || 0
  const totalDebit = summary.find((r) => r.type === 'Debit')?.total || 0
  const net = totalCredit - totalDebit
  const netSign = net >= 0 ? '+' : '-'
  const grand = totalCredit + totalDebit
  const catGrand = categories.reduce((s, r) => s + Number(r.total), 0)

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <p>Loading income flow data…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorBox}>❌ {error}</div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* ─── Page Header ─── */}
      <header className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>💰</div>
          <div>
            <h1 className={styles.headerTitle}>Credit vs Debit</h1>
            <p className={styles.headerSub}>income_flow · monthly financial flow</p>
          </div>
        </div>
        <div className={styles.liveIndicator}>
          <div className={styles.liveDot} />
          <span>Live · Neon PostgreSQL</span>
        </div>
      </header>

      <main className={styles.main}>
        {/* ─── KPI Row ─── */}
        <SectionLabel text="Overview" />
        <div className={styles.kpiGrid}>
          <KpiCard icon="📈" label="Total Credits" value={formatINR(totalCredit)} accent={BLUE} />
          <KpiCard icon="📉" label="Total Debits" value={formatINR(totalDebit)} accent={NEGATIVE} />
          <KpiCard
            icon="⚖️"
            label="Net Flow"
            value={`${netSign}${formatINR(Math.abs(net))}`}
            accent={net >= 0 ? POSITIVE : NEGATIVE}
          />
        </div>

        {/* ─── Donut + Summary Row ─── */}
        <div className={styles.twoCol}>
          <CardWrapper title="Flow Distribution" badge="LIVE">
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={summary.map((r) => ({ name: r.type, value: Number(r.total) }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="#F0F4FF"
                    strokeWidth={3}
                  >
                    {summary.map((r) => (
                      <Cell
                        key={r.type}
                        fill={CHART_COLORS[r.type] || BLUE}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardWrapper>

          <CardWrapper title="Flow Summary" subtitle="credit vs debit">
            <div className={styles.flowList}>
              {summary.map((r) => (
                <FlowSummaryRow
                  key={r.type}
                  label={r.type}
                  total={Number(r.total)}
                  grand={grand}
                  color={CHART_COLORS[r.type] || BLUE}
                />
              ))}
            </div>
          </CardWrapper>
        </div>

        {/* ─── Category Breakdown ─── */}
        <SectionLabel text="Category Breakdown" />

        <div className={styles.toggleRow}>
          {(['Credit', 'Debit'] as const).map((t) => (
            <button
              key={t}
              className={`${styles.toggleBtn} ${selectedType === t ? styles.toggleActive : ''}`}
              onClick={() => setSelectedType(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {categories.length > 0 ? (
          <div className={styles.twoCol}>
            <CardWrapper title={`${selectedType} Breakdown`} subtitle="by category">
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={categories.map((r) => ({ name: r.item, value: Number(r.total) }))}
                    layout="vertical"
                    margin={{ top: 8, right: 40, bottom: 8, left: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => formatINR(v)}
                      tick={{ fill: MUTED, fontSize: 11 }}
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fill: MUTED, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                      {categories.map((_, i) => (
                        <Cell key={i} fill={BLUE_SEQ[i % BLUE_SEQ.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardWrapper>

            <CardWrapper title={`${selectedType} Categories`}>
              <div className={styles.flowList}>
                {categories.map((r, i) => (
                  <FlowSummaryRow
                    key={r.item}
                    label={r.item}
                    total={Number(r.total)}
                    grand={catGrand}
                    color={BLUE_SEQ[i % BLUE_SEQ.length]}
                  />
                ))}
              </div>
            </CardWrapper>
          </div>
        ) : (
          <div className={styles.emptyState}>
            No {selectedType.toLowerCase()} entries found.
          </div>
        )}
      </main>
    </div>
  )
}
