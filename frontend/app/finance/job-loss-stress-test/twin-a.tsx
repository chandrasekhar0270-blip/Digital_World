'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TwinAData {
  projection_date: string;
  net_asset: number;
  monthly_expense: number;
  liabilities_remaining: number;
  year: number;
}

const COLORS = {
  BLUE: '#2563EB',
  BLUE_LT: '#3B82F6',
  AMBER: '#F59E0B',
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
        📈
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

export default function TwinAPage() {
  const [data, setData] = useState<TwinAData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/stress-test?type=twin_a');
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const result = await response.json();
        setData(result.data);
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
        <PageHeader title="Twin A Projection" subtitle="Current Scenario — Liabilities Reducing Over Time" />
        <div style={{ padding: '2rem', textAlign: 'center', color: COLORS.MUTED }}>
          Loading projection...
        </div>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div style={{ background: COLORS.BG_LIGHT, minHeight: '100vh', padding: '2rem' }}>
        <PageHeader title="Twin A Projection" subtitle="Current Scenario — Liabilities Reducing Over Time" />
        <div style={{ background: '#EFF6FF', border: `1px solid #BFDBFE`, borderLeft: `3px solid ${COLORS.BLUE}`, color: '#1E3A8A', padding: '1rem', margin: '1.5rem' }}>
          ❌ {error || 'No projection data available'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: COLORS.BG_LIGHT, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <PageHeader title="Twin A Projection" subtitle="Current Scenario — Liabilities Reducing Over Time" />

      <div style={{ padding: '1.5rem 2rem 3rem' }}>
        <SectionLabel text="Net Asset Depletion Over Time" />
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
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.BORDER} />
              <XAxis
                dataKey="year"
                tick={{ fill: COLORS.MUTED, fontSize: 11 }}
                label={{ value: 'Year', position: 'insideBottomRight', offset: -10 }}
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
                dataKey="net_asset"
                stroke={COLORS.AMBER}
                strokeWidth={3}
                dot={{ fill: COLORS.AMBER, r: 4 }}
                name="Net Asset (Twin A)"
              />
              <Line
                type="monotone"
                dataKey="liabilities_remaining"
                stroke={COLORS.BLUE_LT}
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Liabilities Remaining"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <SectionLabel text="Data Table" />
        <div
          style={{
            background: COLORS.BG_WHITE,
            border: `1px solid ${COLORS.BORDER}`,
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9rem',
            }}
          >
            <thead>
              <tr style={{ background: '#F8FAFF', borderBottom: `1px solid ${COLORS.BORDER}` }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', color: COLORS.MUTED }}>
                  Year
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', color: COLORS.MUTED }}>
                  Net Asset
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', color: COLORS.MUTED }}>
                  Liabilities Remaining
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', color: COLORS.MUTED }}>
                  Monthly Expense
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.BORDER}` }}>
                  <td style={{ padding: '0.8rem 1rem', color: COLORS.TEXT }}>
                    {row.year}
                  </td>
                  <td style={{ padding: '0.8rem 1rem', color: COLORS.TEXT, fontWeight: '600' }}>
                    ₹{(row.net_asset / 1000000).toFixed(1)}Cr
                  </td>
                  <td style={{ padding: '0.8rem 1rem', color: COLORS.TEXT }}>
                    ₹{(row.liabilities_remaining / 1000000).toFixed(1)}Cr
                  </td>
                  <td style={{ padding: '0.8rem 1rem', color: COLORS.TEXT }}>
                    ₹{(row.monthly_expense / 100000).toFixed(1)}L
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
