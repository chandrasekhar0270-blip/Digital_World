import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getSQL } from '@/lib/db'

/**
 * GET /api/finance/income-flow
 *
 * Query params:
 *   ?view=summary        → Credit vs Debit totals (default)
 *   ?view=breakdown&type=Credit  → Category breakdown for Credit or Debit
 *
 * Tables: ft.income_flow (type, item, amount)
 */
export async function GET(request: NextRequest) {
  // Auth check
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const view = searchParams.get('view') || 'summary'

  try {
    const sql = getSQL()

    if (view === 'summary') {
      // Credit vs Debit totals — same query as Streamlit Credit_Debit.py
      const rows = await sql`
        SELECT type,
               SUM(CAST(REPLACE(CAST(amount AS TEXT), ',', '') AS NUMERIC)) AS total
        FROM ft.income_flow
        GROUP BY type
      `
      return NextResponse.json({ data: rows })
    }

    if (view === 'breakdown') {
      const flowType = searchParams.get('type') || 'Credit'

      // Category breakdown — same query as Streamlit Credit_Debit.py
      const rows = await sql`
        SELECT TRIM(item) AS item,
               SUM(CAST(
                 NULLIF(REPLACE(REPLACE(CAST(amount AS TEXT), ',', ' '), ' ', ''), '')
                 AS NUMERIC(15,2)
               )) AS total
        FROM ft.income_flow
        WHERE type = ${flowType}
          AND amount IS NOT NULL
        GROUP BY TRIM(item)
        HAVING SUM(CAST(
          NULLIF(REPLACE(REPLACE(CAST(amount AS TEXT), ',', ' '), ' ', ''), '')
          AS NUMERIC(15,2)
        )) > 0
        ORDER BY total DESC
      `
      return NextResponse.json({ data: rows, type: flowType })
    }

    return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 })
  } catch (error) {
    console.error('Income flow API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch income flow data' },
      { status: 500 }
    )
  }
}
