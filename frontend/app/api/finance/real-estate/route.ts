import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getSQL } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const sql = getSQL()
    const rows = await sql`
      SELECT id, category, particulars,
             CAST(REPLACE(CAST(amount AS TEXT), ',', '') AS NUMERIC) AS amount
      FROM ft.cost_of_investment
      ORDER BY category, id
    `
    const data = rows.map(r => ({
      id:          r.id,
      category:    r.category,
      particulars: r.particulars,
      amount:      parseFloat(r.amount),
    }))
    return NextResponse.json(data)
  } catch (error) {
    console.error('Real estate GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { category, particulars, amount } = await request.json()
    if (!category || !particulars || amount === undefined)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const num = parseFloat(amount)
    if (isNaN(num) || num <= 0)
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })

    const sql = getSQL()
    const rows = await sql`
      INSERT INTO ft.cost_of_investment (category, particulars, amount)
      VALUES (${category}, ${particulars}, ${num})
      RETURNING id, category, particulars, amount
    `
    return NextResponse.json({ success: true, data: rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Real estate POST error:', error)
    return NextResponse.json({ error: 'Failed to insert record' }, { status: 500 })
  }
}
