'use client'

import { useEffect, useState, useCallback } from 'react'
import styles from './manual-corrections.module.css'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AssetRow {
  id: number
  description: string
  category: string
  quantity: string
  value: number
  units: string
  interest: number
  payable: string
}

interface CostRow {
  id: number
  category: string
  particulars: string
  amount: number
}

interface ExpenseRow {
  id: number
  claim_date: string
  category: string
  value: number
}

type TableName = 'assets_liabilities' | 'cost_of_investment' | 'expense_claim'
type ActiveTab = 'assets' | 'costs' | 'expenses'

interface EditingCell {
  table: TableName
  id: number
  field: string
  original: string | number
}

// ─── Inline editable cell ─────────────────────────────────────────────────────

function EditableCell({
  table,
  id,
  field,
  value,
  type = 'text',
  onSaved,
}: {
  table: TableName
  id: number
  field: string
  value: string | number
  type?: 'text' | 'number' | 'date'
  onSaved: (table: TableName, id: number, field: string, newValue: string | number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value ?? ''))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = useCallback(async () => {
    if (draft === String(value ?? '')) { setEditing(false); return }
    setSaving(true)
    setError(null)
    try {
      const payload = type === 'number' ? Number(draft) : draft
      const res = await fetch('/api/finance/manual-corrections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, id, field, value: payload }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
      onSaved(table, id, field, payload)
      setEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setSaving(false)
    }
  }, [draft, value, table, id, field, type, onSaved])

  if (!editing) {
    return (
      <span
        className={styles.editableValue}
        onClick={() => { setDraft(String(value ?? '')); setEditing(true) }}
        title="Click to edit"
      >
        {value ?? '—'}
      </span>
    )
  }

  return (
    <span className={styles.editingCell}>
      <input
        autoFocus
        type={type}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
        className={styles.cellInput}
        disabled={saving}
      />
      <button onClick={save} disabled={saving} className={styles.saveBtn}>{saving ? '…' : '✓'}</button>
      <button onClick={() => setEditing(false)} className={styles.cancelBtn}>✕</button>
      {error && <span className={styles.cellError}>{error}</span>}
    </span>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ManualCorrectionsPage() {
  const [tab, setTab] = useState<ActiveTab>('assets')
  const [assets, setAssets] = useState<AssetRow[]>([])
  const [costs, setCosts] = useState<CostRow[]>([])
  const [expenses, setExpenses] = useState<ExpenseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch('/api/finance/manual-corrections')
      .then(r => r.json())
      .then(d => {
        setAssets(d.assets_liabilities ?? [])
        setCosts(d.cost_of_investment ?? [])
        setExpenses(d.expense_claim ?? [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Patch local state after a successful save
  const handleSaved = useCallback((table: TableName, id: number, field: string, newValue: string | number) => {
    if (table === 'assets_liabilities') {
      setAssets(prev => prev.map(r => r.id === id ? { ...r, [field]: newValue } : r))
    } else if (table === 'cost_of_investment') {
      setCosts(prev => prev.map(r => r.id === id ? { ...r, [field]: newValue } : r))
    } else {
      setExpenses(prev => prev.map(r => r.id === id ? { ...r, [field]: newValue } : r))
    }
  }, [])

  const tabs: { key: ActiveTab; label: string; count: number }[] = [
    { key: 'assets',   label: 'Assets & Liabilities', count: assets.length },
    { key: 'costs',    label: 'Cost of Investment',   count: costs.length },
    { key: 'expenses', label: 'Expense Claims',        count: expenses.length },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manual Corrections</h1>
        <p className={styles.subtitle}>Click any value to edit it in-place. Changes are saved directly to the database.</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map(t => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <span className={styles.badge}>{t.count}</span>
          </button>
        ))}
      </div>

      {loading && <div className={styles.state}>Loading data…</div>}
      {error   && <div className={styles.stateError}>Error: {error}</div>}

      {!loading && !error && (
        <>
          {/* ── Assets & Liabilities ── */}
          {tab === 'assets' && (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Value (₹)</th>
                    <th>Units</th>
                    <th>Interest %</th>
                    <th>Payable</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map(row => (
                    <tr key={row.id}>
                      <td className={styles.idCell}>{row.id}</td>
                      <td><EditableCell table="assets_liabilities" id={row.id} field="description" value={row.description} onSaved={handleSaved} /></td>
                      <td><EditableCell table="assets_liabilities" id={row.id} field="category"    value={row.category}    onSaved={handleSaved} /></td>
                      <td><EditableCell table="assets_liabilities" id={row.id} field="quantity"    value={row.quantity}    onSaved={handleSaved} /></td>
                      <td><EditableCell table="assets_liabilities" id={row.id} field="value"       value={row.value}       type="number" onSaved={handleSaved} /></td>
                      <td><EditableCell table="assets_liabilities" id={row.id} field="units"       value={row.units}       onSaved={handleSaved} /></td>
                      <td><EditableCell table="assets_liabilities" id={row.id} field="interest"    value={row.interest}    type="number" onSaved={handleSaved} /></td>
                      <td><EditableCell table="assets_liabilities" id={row.id} field="payable"     value={row.payable}     onSaved={handleSaved} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Cost of Investment ── */}
          {tab === 'costs' && (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Particulars</th>
                    <th>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map(row => (
                    <tr key={row.id}>
                      <td className={styles.idCell}>{row.id}</td>
                      <td><EditableCell table="cost_of_investment" id={row.id} field="category"    value={row.category}    onSaved={handleSaved} /></td>
                      <td><EditableCell table="cost_of_investment" id={row.id} field="particulars" value={row.particulars} onSaved={handleSaved} /></td>
                      <td><EditableCell table="cost_of_investment" id={row.id} field="amount"      value={row.amount}      type="number" onSaved={handleSaved} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Expense Claims ── */}
          {tab === 'expenses' && (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Value (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(row => (
                    <tr key={row.id}>
                      <td className={styles.idCell}>{row.id}</td>
                      <td><EditableCell table="expense_claim" id={row.id} field="claim_date" value={row.claim_date?.slice(0,10)} type="date" onSaved={handleSaved} /></td>
                      <td><EditableCell table="expense_claim" id={row.id} field="category"   value={row.category}                onSaved={handleSaved} /></td>
                      <td><EditableCell table="expense_claim" id={row.id} field="value"      value={row.value}                  type="number" onSaved={handleSaved} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
