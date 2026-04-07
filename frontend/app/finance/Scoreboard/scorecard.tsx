'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ScorecardData {
  category: string;
  amount: number;
  formatted_amount: string;
}

const COLORS = {
  BLUE: '#2563EB',
  BLUE_LT: '#3B82F6',
  CYAN: '#0EA5E9',
  POSITIVE: '#10B981',
  NEGATIVE: '#EF4444',
  AMBER: '#F59E0B',
  MUTED: '#64748B',
  TEXT: '#1E293B',
  BORDER: '#E2E8F0',
  BG_LIGHT: '#F0F4FF',
  BG_WHITE: '#FFFFFF',
};

const PageHeader = ({ title, subtitle, icon }: { title: string; subtitle: string; icon: string }) => {
  return (
    <div
      style={{
        background: COLORS.BG_WHITE,
        borderBottom: `1px solid ${COLORS.BORDER}`,
        padding: '1.1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            boxShadow: `0 2px 8px rgba(37, 99, 235, 0.25)`,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <div
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.2rem',
              fontWeight: '800',
              color: '#1E3A8A',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '0.62rem',
              color: '#94A3B8',
              marginTop: '2px',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
};

interface KPIGlassProps {
  icon: string;
  label: string;
  value: string;
  deltaValue: string;
  deltaLabel: string;
  accent: string;
  delayMs: number;
}

const KPIGlass = ({
  icon,
  label,
  value,
  deltaValue,
  deltaLabel,
  accent,
  delayMs,
}: KPIGlassProps) => {
  const isPositive = !deltaValue.startsWith('-');
  const dcolor = isPositive ? COLORS.POSITIVE : COLORS.NEGATIVE;
  const arrow = isPositive ? '↑' : '↓';

  return (
    <div
      style={{
        background: COLORS.BG_WHITE,
        border: `1px solid ${COLORS.BORDER}`,
        borderTop: `3px solid ${accent}`,
        borderRadius: '14px',
        padding: '1.2rem 1.3rem',
        boxShadow: `0 1px 6px rgba(37, 99, 235, 0.07)`,
        animation: `fadeUp 0.4s ease ${delayMs}ms both`,
        transition: 'all 0.18s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 18px rgba(37, 99, 235, 0.12)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 6px rgba(37, 99, 235, 0.07)';
      }}
    >
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '9px',
          background: `${accent}18`,
          border: `1px solid ${accent}25`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.95rem',
          marginBottom: '0.8rem',
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.56rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.17em',
          color: '#94A3B8',
          marginBottom: '4px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '1.6rem',
          fontWeight: '800',
          color: accent,
          lineHeight: '1.1',
        }}
      >
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '7px' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: '600', color: dcolor }}>
          {arrow} {deltaValue}
        </span>
        <span style={{ fontSize: '0.6rem', color: '#94A3B8' }}>{deltaLabel}</span>
      </div>
    </div>
  );
};

const CardHeader = ({ title, subtitle, badge }: { title: string; subtitle?: string; badge?: string }) => {
  const badgeHtml = badge ? (
    <span
      style={{
        background: `${COLORS.BLUE}18`,
        color: COLORS.BLUE,
        fontSize: '0.55rem',
        fontWeight: '700',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        padding: '3px 9px',
        borderRadius: '20px',
        border: `1px solid ${COLORS.BLUE}28`,
      }}
    >
      {badge}
    </span>
  ) : null;

  const sub = subtitle ? (
    <div style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '2px' }}>
      {subtitle}
    </div>
  ) : null;

  return (
    <div
      style={{
        padding: '0.95rem 1.3rem 0.8rem',
        borderBottom: `1px solid #F1F5F9`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '0.9rem',
            fontWeight: '700',
            color: '#1E3A8A',
          }}
        >
          {title}
        </div>
        {sub}
      </div>
      <div>{badgeHtml}</div>
    </div>
  );
};

const CardOpen = ({
  children,
  title,
  subtitle,
  badge,
  accent = COLORS.BLUE,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  badge?: string;
  accent?: string;
}) => {
  const header = title ? <CardHeader title={title} subtitle={subtitle} badge={badge} /> : null;

  return (
    <div
      style={{
        background: COLORS.BG_WHITE,
        border: `1px solid ${COLORS.BORDER}`,
        borderTop: `2px solid ${accent}55`,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: `0 1px 8px rgba(37, 99, 235, 0.06)`,
        animation: 'fadeUp 0.4s ease both',
      }}
    >
      {header}
      <div style={{ padding: '1.5rem' }}>{children}</div>
    </div>
  );
};

export default function Scorecard() {
  const [data, setData] = useState<ScorecardData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/scorecard');
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const fetchedData: ScorecardData[] = await response.json();
        setData(fetchedData);
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
      <div
        style={{
          background: COLORS.BG_LIGHT,
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <PageHeader title="Net Asset Scorecard" subtitle="Loading..." icon="💰" />
        <div style={{ padding: '2rem', textAlign: 'center', color: COLORS.MUTED }}>
          Loading scorecard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: COLORS.BG_LIGHT,
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <PageHeader title="Net Asset Scorecard" subtitle="Error" icon="💰" />
        <div
          style={{
            background: '#EFF6FF',
            border: `1px solid #BFDBFE`,
            borderLeft: `3px solid ${COLORS.BLUE}`,
            borderRadius: '0 12px 12px 0',
            color: '#1E3A8A',
            padding: '1rem 1.25rem',
            margin: '1.5rem 2rem',
          }}
        >
          ❌ {error}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          background: COLORS.BG_LIGHT,
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <PageHeader title="Net Asset Scorecard" subtitle="No data available" icon="💰" />
        <div style={{ padding: '2rem', textAlign: 'center', color: COLORS.MUTED }}>
          No scorecard data found in database
        </div>
      </div>
    );
  }

  // Extract values from data
  const assetsData = data.find((item) => item.category === 'Assets');
  const liabilitiesData = data.find((item) => item.category === 'Liabilities');
  const netWorthData = data.find((item) => item.category === 'Net Worth');

  if (!assetsData || !liabilitiesData || !netWorthData) {
    return (
      <div
        style={{
          background: COLORS.BG_LIGHT,
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <PageHeader title="Net Asset Scorecard" subtitle="Data incomplete" icon="💰" />
        <div style={{ padding: '2rem', textAlign: 'center', color: COLORS.MUTED }}>
          Missing required data categories (Assets, Liabilities, Net Worth)
        </div>
      </div>
    );
  }

  // Calculate metrics
  const assetsVal = assetsData.amount;
  const liabilitiesVal = liabilitiesData.amount;
  const netWorthVal = netWorthData.amount;

  const debtRatio = assetsVal > 0 ? Math.round((liabilitiesVal / assetsVal) * 100 * 10) / 10 : 0;
  const equityRatio = assetsVal > 0 ? Math.round((netWorthVal / assetsVal) * 100 * 10) / 10 : 0;
  const liabilityCover = liabilitiesVal > 0 ? Math.round((assetsVal / liabilitiesVal) * 100) / 100 : 0;

  const chartData = [
    { name: 'Assets', value: assetsVal, formatted: assetsData.formatted_amount, fill: COLORS.BLUE },
    { name: 'Liabilities', value: liabilitiesVal, formatted: liabilitiesData.formatted_amount, fill: COLORS.NEGATIVE },
    { name: 'Net Worth', value: netWorthVal, formatted: netWorthData.formatted_amount, fill: COLORS.POSITIVE },
  ];

  return (
    <div
      style={{
        background: COLORS.BG_LIGHT,
        minHeight: '100vh',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <PageHeader
        title="Net Asset Scorecard"
        subtitle="net_worth_summary · Assets · Liabilities · Net Worth"
        icon="💰"
      />

      <div style={{ padding: '1.3rem 1.8rem 2rem' }}>
        {/* Row 1: 4 KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.2rem',
            marginBottom: '1.5rem',
          }}
        >
          <KPIGlass
            icon="📈"
            label="Total Assets"
            value={assetsData.formatted_amount}
            deltaValue="+100%"
            deltaLabel="of portfolio"
            accent={COLORS.BLUE}
            delayMs={0}
          />
          <KPIGlass
            icon="📉"
            label="Total Liabilities"
            value={liabilitiesData.formatted_amount}
            deltaValue={`-${debtRatio}%`}
            deltaLabel="of assets"
            accent={COLORS.NEGATIVE}
            delayMs={60}
          />
          <KPIGlass
            icon="💎"
            label="Net Worth"
            value={netWorthData.formatted_amount}
            deltaValue={`+${equityRatio}%`}
            deltaLabel="equity ratio"
            accent={COLORS.POSITIVE}
            delayMs={120}
          />
          <KPIGlass
            icon="🛡️"
            label="Asset Coverage"
            value={`${liabilityCover}×`}
            deltaValue="+cover"
            deltaLabel="liabilities"
            accent={COLORS.AMBER}
            delayMs={180}
          />
        </div>

        {/* Row 2: Portfolio Composition Chart */}
        <CardOpen
          title="Portfolio Composition"
          subtitle="Assets · Liabilities · Net Worth"
          badge="LIVE"
          accent={COLORS.BLUE}
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.BORDER} />
              <XAxis dataKey="name" tick={{ fill: COLORS.MUTED, fontSize: 11 }} />
              <YAxis
                tick={{ fill: COLORS.MUTED, fontSize: 11 }}
                label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  background: COLORS.BG_WHITE,
                  border: `1px solid ${COLORS.BORDER}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string, props: any) => {
                  return [props.payload.formatted, props.payload.name];
                }}
              />
              <Bar
                dataKey="value"
                fill={COLORS.BLUE}
                radius={[8, 8, 0, 0]}
                label={{
                  position: 'top' as const,
                  fill: COLORS.MUTED,
                  fontSize: 11,
                  formatter: (value: number) => '₹' + (value / 1000000).toFixed(1) + 'M',
                }}
              >
                {chartData.map((entry, index) => (
                  <Bar key={`bar-${index}`} dataKey="value" fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardOpen>
      </div>
    </div>
  );
}
