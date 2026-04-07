import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getSQL } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const view = new URL(request.url).searchParams.get('view') || 'stress'

  try {
    const sql = getSQL()

    if (view === 'stress') {
      const rows = await sql`
        SELECT score_date, stress_score, sustainability, stress_band,
               total_monthly_expenses, financial_runway_months, liability_to_asset_pct
        FROM ft.stress_score
        ORDER BY score_date DESC
      `
      return NextResponse.json(rows)
    }

    if (view === 'twin-a') {
      const rows = await sql`
        SELECT month_number, year_number, projection_date,
               net_asset, monthly_expense, annual_expense,
               inflation_rate, months_to_zero
        FROM ft.burndown_results
        WHERE scenario = 'TWIN_A'
        ORDER BY month_number ASC
        LIMIT 120
      `
      return NextResponse.json(rows)
    }

    if (view === 'compare') {
      const rows = await sql`
        SELECT month_number, scenario,
               net_asset, monthly_expense, months_to_zero
        FROM ft.burndown_results
        WHERE scenario IN ('TWIN_A', 'TWIN_B')
        ORDER BY month_number ASC, scenario ASC
      `
      return NextResponse.json(rows)
    }

    return NextResponse.json({ error: 'Invalid view' }, { status: 400 })
  } catch (error) {
    console.error('Financial twin error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
