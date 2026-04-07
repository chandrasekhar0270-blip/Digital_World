import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const sql = getSQL()
    const rows = await sql`
      SELECT id, description, category, quantity, value, units, interest
      FROM ft.assets_liabilities
      WHERE category = 'Asset'
      ORDER BY id
    `
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Asset valuation error:', error)
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}
