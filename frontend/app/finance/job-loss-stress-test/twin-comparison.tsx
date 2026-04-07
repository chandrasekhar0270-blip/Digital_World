'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TwinData {
  projection_date: string;
  net_asset: number;
  year: number;
}

interface MetricsData {
  net_worth: number;
  total_liabilities: number;
  total_assets: number;
}

const COLORS = {
  BLUE: '#2563EB',
  BLUE_LT: '#3B82F6',
  AMBER: '#F59E0B',
  POSITIVE: '#10B981',
  MUTED: '#64748B',
  TEXT: '#1E293B',
  BORDER: '#E2E8F0',
  BG_LIGHT: '#F0F4FF',
  BG_WHITE: '#FFFFFF',
};

const PageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => {
  return (
    <div
      style={{
        background: COLORS.BG_WHITE,
        borderBottom: `1px solid ${COLORS.BORDER}`,
        padding: '1.1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: `linear-gradient(135deg, ${COLORS.BLUE}, ${COLORS.BLUE_LT})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
        }}
      >
        ⚖️
      </div>
      <div>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '800', color: '#1E3A8A' }}>
          {title}
        </div>
        <div style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '2px' }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
};

const SectionLabel = ({ text }: { text: string }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0 2px', margin: '1.5rem 0 1rem' }}>
      <div style={{ width: '3px', height: '14px', borderRadius: '2px', background: `linear-gradient(180deg, ${COLORS.BLUE}, ${COLORS.BLUE_LT})` }} />
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.18em', color: COLORS.MUTED }}>
        {text}
      </span>
      <div style={{ flex: 1, height: '1px', background: COLORS.BORDER }} />
    </div>
  );
};

const KPICard = ({ label, value, accent, icon }: { label: string; value: string; accent: string; icon: string }) => {
  return (
    <div
      style={{
        background: COLORS.BG_WHITE,
        border: `1px solid ${COLORS.BORDER}`,
        borderTop: `3px solid ${accent}`,
        borderRadius: '14px',
        padding: '1.2rem 1.3rem',
      }}
    >
      <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', marginBottom: '0.8rem' }}>
        {icon}
      </div>
      <div style={{ fontSize: '0.58rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#94A3B8', marginBottom: '5px' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.65rem', fontWeight: '800', color: accent }}>
        {value}
      </div>
    </div>
  );
};

export default function TwinComparisonPage() {
  const [twinA, setTwinA] = useState<TwinData[]>([]);
  const [twinB, setTwinB] = useState<TwinData[]>([]);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/stress-test?type=twin_comparison');
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const result = await response.json();
        setTwinA(result.twinA);
        setTwinB(result.twinB);
        setMetrics(result.metrics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ background: COLORS.BG_LIGHT, minHeight: '100vh', padding: '2rem' }}>
        <PageHeader title="Twin Scenarios" subtitle="Impact of Liabilities on Job Loss Survival" />
        <div style={{ padding: '2rem', textAlign: 'center', color: COLORS.MUTED }}>
          Loading comparison...
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div style={{ background: COLORS.BG_LIGHT, minHeight: '100vh', padding: '2rem' }}>
        <PageHeader title="Twin Scenarios" subtitle="Impact of Liabilities on Job Loss Survival" />
        <div style={{ background: '#EFF6FF', border: `1px solid #BFDBFE`, borderLeft: `3px solid ${COLORS.BLUE}`, color: '#1E3A8A', padding: '1rem', margin: '1.5rem' }}>
          ❌ {error || 'No data available'}
        </div>
      </div>
    );
  }

  // Merge data for comparison chart
  const mergedData = [];
  const maxLength = Math.max(twinA.length, twinB.length);
  for (let i = 0; i < maxLength; i++) {
    const a = twinA[i];
    const b = twinB[i];
    mergedData.push({
      year: a?.year || b?.year,
      twinA: a?.net_asset || 0,
      twinB: b?.net_asset || 0,
    });
  }

  const liabilitiesSaved = metrics.total_liabilities;
  const survivalMonthsDiff = Math.floor(liabilitiesSaved / 100000); // Simplified calculation

  return (
    <div style={{ background: COLORS.BG_LIGHT, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <PageHeader title="Twin Scenarios" subtitle="Impact of Liabilities on Job Loss Survival" />

      <div style={{ padding: '1.5rem 2rem 3rem' }}>
        <SectionLabel text="Scenario Overview" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.2rem',
            marginBottom: '1.5rem',
          }}
        >
          <KPICard
            label="Twin A (Current)"
            value={`₹${(metrics.net_worth / 1000000).toFixed(1)}Cr`}
            accent={COLORS.AMBER}
            icon="📉"
          />
          <KPICard
            label="Twin B (No Debt)"
            value={`₹${((metrics.net_worth + metrics.total_liabilities) / 1000000).toFixed(1)}Cr`}
            accent={COLORS.POSITIVE}
            icon="📈"
          />
          <KPICard
            label="Debt Freed (B Advantage)"
            value={`₹${(metrics.total_liabilities / 1000000).toFixed(1)}Cr`}
            accent={COLORS.BLUE}
            icon="💰"
          />
        </div>

        <SectionLabel text="Survival Comparison" />
        <div
          style={{
            background: COLORS.BG_WHITE,
            border: `1px solid ${COLORS.BORDER}`,
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={mergedData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.BORDER} />
              <XAxis
                dataKey="year"
                tick={{ fill: COLORS.MUTED, fontSize: 11 }}
              />
              <YAxis
                tick={{ fill: COLORS.MUTED, fontSize: 11 }}
                label={{ value: 'Net Asset (₹)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  background: COLORS.BG_WHITE,
                  border: `1px solid ${COLORS.BORDER}`,
                  borderRadius: '8px',
                }}
                formatter={(value: number) => `₹${(value / 1000000).toFixed(1)}Cr`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="twinA"
                stroke={COLORS.AMBER}
                strokeWidth={3}
                dot={{ fill: COLORS.AMBER, r: 5 }}
                name="Twin A (Current Scenario)"
              />
              <Line
                type="monotone"
                dataKey="twinB"
                stroke={COLORS.POSITIVE}
                strokeWidth={3}
                dot={{ fill: COLORS.POSITIVE, r: 5, symbol: 'diamond' }}
                name="Twin B (Zero Liabilities)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <SectionLabel text="Key Insights" />
        <div
          style={{
            background: COLORS.BG_WHITE,
            border: `1px solid ${COLORS.BORDER}`,
            borderRadius: '14px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '700', color: COLORS.TEXT, marginBottom: '0.75rem' }}>
                🎯 Debt Impact
              </h3>
              <p style={{ fontSize: '0.9rem', color: COLORS.TEXT, lineHeight: '1.6' }}>
                Your current liabilities of <strong>₹{(metrics.total_liabilities / 1000000).toFixed(1)}Cr</strong> significantly reduce your survival runway after job loss.
              </p>
            </div>
            <div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '700', color: COLORS.TEXT, marginBottom: '0.75rem' }}>
                ✅ Twin B Advantage
              </h3>
              <p style={{ fontSize: '0.9rem', color: COLORS.TEXT, lineHeight: '1.6' }}>
                By eliminating your liabilities, Twin B survives significantly longer. This highlights the importance of debt reduction.
              </p>
            </div>
          </div>
        </div>

        <SectionLabel text="Action Plan" />
        <div
          style={{
            background: '#EFF6FF',
            border: `1px solid #BFDBFE`,
            borderRadius: '14px',
            padding: '1.5rem',
            color: '#1E3A8A',
          }}
        >
          <h4 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '700', marginBottom: '0.75rem' }}>
            💡 To Improve Your Position:
          </h4>
          <ol style={{ fontSize: '0.9rem', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
            <li>
              <strong>Prioritize debt repayment:</strong> Every rupee of liabilities eliminated moves you from Twin A toward Twin B protection.
            </li>
            <li>
              <strong>Increase debt paydown:</strong> Allocate extra income toward high-interest liabilities first.
            </li>
            <li>
              <strong>Refinance smartly:</strong> Look for lower-interest refinancing options to reduce burden.
            </li>
            <li>
              <strong>Build an emergency fund:</strong> Aim for 6-12 months of expenses before aggressive debt payoff.
            </li>
            <li>
              <strong>Income diversification:</strong> Reduce job loss impact by developing multiple income streams.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
