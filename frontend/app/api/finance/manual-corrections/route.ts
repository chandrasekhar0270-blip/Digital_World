import { NextRequest, NextResponse } from 'next/server'
import { getSQL } from '@/lib/db'

// GET: fetch all records from the three editable tables
export async function GET() {
  try {
    const sql = getSQL()

    const [assets, costs, expenses] = await Promise.all([
      sql`
        SELECT id, description, category, quantity, value, units, interest, payable
        FROM ft.assets_liabilities
        ORDER BY category, description
      `,
      sql`
        SELECT id, category, particulars, amount
        FROM ft.cost_of_investment
        ORDER BY category, particulars
      `,
      sql`
        SELECT id, claim_date, category, value
        FROM ft.expense_claim
        ORDER BY claim_date DESC, category
      `,
    ])

    return NextResponse.json({ assets_liabilities: assets, cost_of_investment: costs, expense_claim: expenses })
  } catch (err) {
    console.error('manual-corrections GET error', err)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

// PATCH: update a single field in a table row
// Body: { table: 'assets_liabilities' | 'cost_of_investment' | 'expense_claim', id: number, field: string, value: any }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { table, id, field, value } = body

    if (!table || !id || !field || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const ALLOWED: Record<string, string[]> = {
      assets_liabilities: ['description', 'category', 'quantity', 'value', 'units', 'interest', 'payable'],
      cost_of_investment: ['category', 'particulars', 'amount'],
      expense_claim: ['claim_date', 'category', 'value'],
    }

    if (!ALLOWED[table]) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }
    if (!ALLOWED[table].includes(field)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 })
    }

    const sql = getSQL()

    // Build safe parameterised query using tagged template
    // We can't use dynamic identifiers in neon tagged templates, so use a map
    let updated: unknown[]

    if (table === 'assets_liabilities') {
      switch (field) {
        case 'description': updated = await sql`UPDATE ft.assets_liabilities SET description=${value} WHERE id=${id} RETURNING *`; break
        case 'category':    updated = await sql`UPDATE ft.assets_liabilities SET category=${value}    WHERE id=${id} RETURNING *`; break
        case 'quantity':    updated = await sql`UPDATE ft.assets_liabilities SET quantity=${value}    WHERE id=${id} RETURNING *`; break
        case 'value':       updated = await sql`UPDATE ft.assets_liabilities SET value=${value}       WHERE id=${id} RETURNING *`; break
        case 'units':       updated = await sql`UPDATE ft.assets_liabilities SET units=${value}       WHERE id=${id} RETURNING *`; break
        case 'interest':    updated = await sql`UPDATE ft.assets_liabilities SET interest=${value}    WHERE id=${id} RETURNING *`; break
        case 'payable':     updated = await sql`UPDATE ft.assets_liabilities SET payable=${value}     WHERE id=${id} RETURNING *`; break
        default: return NextResponse.json({ error: 'Invalid field' }, { status: 400 })
      }
    } else if (table === 'cost_of_investment') {
      switch (field) {
        case 'category':    updated = await sql`UPDATE ft.cost_of_investment SET category=${value}    WHERE id=${id} RETURNING *`; break
        case 'particulars': updated = await sql`UPDATE ft.cost_of_investment SET particulars=${value} WHERE id=${id} RETURNING *`; break
        case 'amount':      updated = await sql`UPDATE ft.cost_of_investment SET amount=${value}      WHERE id=${id} RETURNING *`; break
        default: return NextResponse.json({ error: 'Invalid field' }, { status: 400 })
      }
    } else {
      switch (field) {
        case 'claim_date': updated = await sql`UPDATE ft.expense_claim SET claim_date=${value} WHERE id=${id} RETURNING *`; break
        case 'category':   updated = await sql`UPDATE ft.expense_claim SET category=${value}   WHERE id=${id} RETURNING *`; break
        case 'value':      updated = await sql`UPDATE ft.expense_claim SET value=${value}      WHERE id=${id} RETURNING *`; break
        default: return NextResponse.json({ error: 'Invalid field' }, { status: 400 })
      }
    }

    return NextResponse.json({ updated: (updated as unknown[])[0] })
  } catch (err) {
    console.error('manual-corrections PATCH error', err)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
