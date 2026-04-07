'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface CostRow {
  id: number
  category: string
  particulars: string
  amount: number
}

const BLUE   = '#2563EB'
const GREEN  = '#10B981'
const RED    = '#EF4444'
const MUTED  = '#64748B'
const BORDER = '#E2E8F0'
const WHITE  = '#FFFFFF'
const BG     = '#F8FAFF'

const CATEGORIES = ['Purchase Cost', 'Interest', 'Sale']

function fmt(n: number) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(2)} L`
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export default function FinancialEntryPage() {
  const [rows, setRows]         = useState<CostRow[]>([])
  const [loading, setLoading]   = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]   = useState<string | null>(null)
  const [error, setError]       = useState<string | null>(null)

  const [form, setForm] = useState({ category: 'Purchase Cost', particulars: '', amount: '' })

  const fetchRows = () => {
    setLoading(true)
    fetch('/api/finance/real-estate')
      .then(r => r.json())
      .then(d => setRows(d))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRows() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSuccess(null)
    setError(null)
    try {
      const res = await fetch('/api/finance/real-estate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || `HTTP ${res.status}`) }
      setSuccess('Record added successfully!')
      setForm({ category: 'Purchase Cost', particulars: '', amount: '' })
      fetchRows()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: `1px solid ${BORDER}`, borderRadius: 8,
    fontSize: '0.88rem', color: '#1E293B', background: WHITE, outline: 'none',
    fontFamily: 'Inter,sans-serif', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Inter,sans-serif' }}>
      {/* Header */}
      <header style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/finance/real-estate" style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: MUTED, textDecoration: 'none' }}>←</Link>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${GREEN}, #34D399)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', boxShadow: `0 2px 8px rgba(5,150,105,0.25)` }}>✏️</div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A' }}>Financial Entry</div>
            <div style={{ fontSize: '0.6rem', color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginTop: 2 }}>ft.cost_of_investment · Add / View Records</div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── Entry Form ── */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderTop: `3px solid ${GREEN}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 8px rgba(37,99,235,0.05)' }}>
          <div style={{ padding: '0.9rem 1.3rem', borderBottom: `1px solid #F1F5F9` }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E3A8A' }}>Add New Record</div>
            <div style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: 2 }}>Insert into ft.cost_of_investment</div>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '1.3rem', display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Particulars</label>
              <input
                type="text"
                placeholder="e.g. Down Payment, EMI, Registration…"
                value={form.particulars}
                onChange={e => setForm(f => ({ ...f, particulars: e.target.value }))}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 500000"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                required
                min="1"
                style={inputStyle}
              />
            </div>

            {success && <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: '#065F46' }}>✅ {success}</div>}
            {error   && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: '#991B1B' }}>❌ {error}</div>}

            <button
              type="submit"
              disabled={submitting}
              style={{ background: submitting ? '#94A3B8' : GREEN, color: WHITE, border: 'none', borderRadius: 8, padding: '12px', fontSize: '0.88rem', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Inter,sans-serif', transition: 'background 0.2s' }}
            >
              {submitting ? 'Saving…' : '+ Add Record'}
            </button>
          </form>
        </div>

        {/* ── Records Table ── */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 8px rgba(37,99,235,0.05)' }}>
          <div style={{ padding: '0.9rem 1.3rem', borderBottom: `1px solid #F1F5F9`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E3A8A' }}>All Records</div>
            <span style={{ background: `${BLUE}12`, color: BLUE, fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '3px 9px', borderRadius: 20, border: `1px solid ${BLUE}25` }}>{rows.length} rows</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: MUTED, fontSize: '0.85rem' }}>Loading…</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFF' }}>
                    {['Category', 'Particulars', 'Amount'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.1em', borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: `1px solid #F1F5F9`, background: i % 2 === 0 ? WHITE : '#FAFBFF' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                          background: r.category === 'Sale' ? `${GREEN}15` : r.category === 'Interest' ? `${RED}15` : `${BLUE}15`,
                          color: r.category === 'Sale' ? GREEN : r.category === 'Interest' ? RED : BLUE,
                          border: `1px solid ${r.category === 'Sale' ? GREEN : r.category === 'Interest' ? RED : BLUE}25`,
                        }}>{r.category}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#1E293B' }}>{r.particulars}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: BLUE }}>{fmt(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#F1F5F9', borderTop: `2px solid ${BORDER}` }}>
                    <td colSpan={2} style={{ padding: '10px 14px', fontWeight: 700, fontSize: '0.78rem', color: '#1E293B' }}>Total</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800, color: BLUE }}>{fmt(rows.reduce((s, r) => s + r.amount, 0))}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
