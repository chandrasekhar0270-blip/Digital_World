import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const sql = getSQL()
    const rows = await sql`
      SELECT category, amount, formatted_amount
      FROM ft.net_worth_summary
      ORDER BY id
    `
    const data = rows.map(r => ({
      category:         r.category,
      amount:           parseFloat(r.amount),
      formatted_amount: r.formatted_amount,
    }))
    return NextResponse.json(data)
  } catch (error) {
    console.error('Scorecard API error:', error)
    return NextResponse.json({ error: 'Failed to fetch scorecard data' }, { status: 500 })
  }
}
