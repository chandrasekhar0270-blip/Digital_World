import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable not set');
    }

    pool = new Pool({
      connectionString: databaseUrl,
    });

    pool.on('error', (err) => {
      console.error('Pool error:', err);
      pool = null;
    });
  }
  return pool;
}

export async function GET(request: NextRequest) {
  const pool = getPool();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'stress_insight';

  try {
    let result;

    if (type === 'stress_insight') {
      // Combine latest stress_score + net_worth_summary rows
      const query = `
        SELECT
          nw_assets.amount        AS total_assets,
          nw_liab.amount          AS total_liabilities,
          nw_net.amount           AS net_worth,
          ss.total_monthly_expenses AS monthly_expense,
          ss.financial_runway_months AS survival_months,
          ss.stress_score,
          ss.score_date           AS last_updated
        FROM ft.stress_score ss
        CROSS JOIN LATERAL (
          SELECT amount FROM ft.net_worth_summary WHERE category = 'Assets'   ORDER BY calculated_at DESC LIMIT 1
        ) nw_assets
        CROSS JOIN LATERAL (
          SELECT amount FROM ft.net_worth_summary WHERE category = 'Liabilities' ORDER BY calculated_at DESC LIMIT 1
        ) nw_liab
        CROSS JOIN LATERAL (
          SELECT amount FROM ft.net_worth_summary WHERE category = 'Net Worth' ORDER BY calculated_at DESC LIMIT 1
        ) nw_net
        ORDER BY ss.score_date DESC
        LIMIT 1
      `;
      result = await pool.query(query);
      return NextResponse.json({
        type: 'stress_insight',
        data: result.rows[0] || null,
      });
    }
    else if (type === 'twin_a') {
      const query = `
        SELECT
          projection_date,
          net_asset,
          monthly_expense,
          EXTRACT(YEAR FROM projection_date) AS year
        FROM ft.burndown_results
        WHERE scenario = 'TWIN_A'
        ORDER BY projection_date ASC
      `;
      result = await pool.query(query);
      return NextResponse.json({
        type: 'twin_a',
        data: result.rows || [],
      });
    }
    else if (type === 'twin_comparison') {
      const queryB = `
        SELECT
          projection_date,
          net_asset AS twin_b_asset,
          monthly_expense,
          EXTRACT(YEAR FROM projection_date) AS year
        FROM ft.burndown_results
        WHERE scenario = 'TWIN_B'
        ORDER BY projection_date ASC
      `;
      const queryA = `
        SELECT
          projection_date,
          net_asset,
          monthly_expense,
          EXTRACT(YEAR FROM projection_date) AS year
        FROM ft.burndown_results
        WHERE scenario = 'TWIN_A'
        ORDER BY projection_date ASC
      `;
      const metricsQuery = `
        SELECT
          nw_assets.amount        AS total_assets,
          nw_liab.amount          AS total_liabilities,
          nw_net.amount           AS net_worth
        FROM
          (SELECT amount FROM ft.net_worth_summary WHERE category = 'Assets'      ORDER BY calculated_at DESC LIMIT 1) nw_assets,
          (SELECT amount FROM ft.net_worth_summary WHERE category = 'Liabilities' ORDER BY calculated_at DESC LIMIT 1) nw_liab,
          (SELECT amount FROM ft.net_worth_summary WHERE category = 'Net Worth'   ORDER BY calculated_at DESC LIMIT 1) nw_net
      `;

      const [resultB, resultA, metricsResult] = await Promise.all([
        pool.query(queryB),
        pool.query(queryA),
        pool.query(metricsQuery),
      ]);

      return NextResponse.json({
        type: 'twin_comparison',
        twinB: resultB.rows || [],
        twinA: resultA.rows || [],
        metrics: metricsResult.rows[0] || null,
      });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error) {
    console.error('Error fetching stress test data:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to fetch stress test data',
        message: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
