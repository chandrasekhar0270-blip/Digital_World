'use client';

import React, { useState, useEffect } from 'react';

interface FinancialSnapshot {
  net_worth: number;
  total_assets: number;
  total_liabilities: number;
  monthly_expense: number;
  survival_months: number;
  stress_score: number;
  last_updated: string;
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
          boxShadow: `0 2px 8px rgba(37, 99, 235, 0.25)`,
        }}
      >
        🧠
      </div>
      <div>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '800', color: '#1E3A8A' }}>
          {title}
        </div>
        <div style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '2px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
};

const SectionLabel = ({ text }: { text: string }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0 2px', margin: '1.5rem 0 1rem' }}>
      <div style={{ width: '3px', height: '14px', borderRadius: '2px', background: `linear-gradient(180deg, ${COLORS.BLUE}, ${COLORS.BLUE_LT})`, flexShrink: 0 }} />
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.18em', color: COLORS.MUTED }}>
        {text}
      </span>
      <div style={{ flex: 1, height: '1px', background: COLORS.BORDER }} />
    </div>
  );
};

const KPICard = ({ label, value, subtext, accent, icon }: { label: string; value: string; subtext?: string; accent: string; icon: string }) => {
  return (
    <div
      style={{
        background: COLORS.BG_WHITE,
        border: `1px solid ${COLORS.BORDER}`,
        borderTop: `3px solid ${accent}`,
        borderRadius: '14px',
        padding: '1.2rem 1.3rem',
        boxShadow: `0 1px 6px rgba(37, 99, 235, 0.07)`,
        animation: 'fadeUp 0.35s ease both',
      }}
    >
      <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: `${accent}18`, border: `1px solid ${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', marginBottom: '0.8rem' }}>
        {icon}
      </div>
      <div style={{ fontSize: '0.58rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#94A3B8', marginBottom: '5px', fontFamily: 'Inter, sans-serif' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.65rem', fontWeight: '800', color: accent, lineHeight: '1.1' }}>
        {value}
      </div>
      {subtext && (
        <div style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '8px' }}>
          {subtext}
        </div>
      )}
    </div>
  );
};

const StressScore = ({ score }: { score: number }) => {
  const getColor = (s: number) => {
    if (s >= 0.8) return COLORS.NEGATIVE;
    if (s >= 0.6) return COLORS.AMBER;
    if (s >= 0.4) return COLORS.BLUE_LT;
    return COLORS.POSITIVE;
  };

  const getLabel = (s: number) => {
    if (s >= 0.8) return 'Critical';
    if (s >= 0.6) return 'High';
    if (s >= 0.4) return 'Moderate';
    return 'Low';
  };

  const color = getColor(score);
  const label = getLabel(score);

  return (
    <div style={{ background: COLORS.BG_WHITE, border: `1px solid ${COLORS.BORDER}`, borderRadius: '14px', padding: '1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '0.62rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.16em', color: COLORS.MUTED, marginBottom: '1rem' }}>
        Overall Stress Score
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: `${color}15`,
            border: `3px solid ${color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color }}>{(score * 100).toFixed(0)}%</div>
          <div style={{ fontSize: '0.75rem', color: COLORS.MUTED, fontWeight: '600', marginTop: '4px' }}>
            {label}
          </div>
        </div>
      </div>
      <p style={{ fontSize: '0.9rem', color: COLORS.TEXT, lineHeight: '1.5' }}>
        {score >= 0.8 && '🚨 Your financial position is precarious. Job loss would be critical.'}
        {score >= 0.6 && score < 0.8 && '⚠️ High stress. Limited runway after job loss.'}
        {score >= 0.4 && score < 0.6 && '📊 Moderate stress. You have some buffer.'}
        {score < 0.4 && '✅ Low stress. Strong position to weather job loss.'}
      </p>
    </div>
  );
};

export default function StressInsightPage() {
  const [data, setData] = useState<FinancialSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/stress-test?type=stress_insight');
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
      <div style={{ background: COLORS.BG_LIGHT, minHeight: '100vh', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
        <PageHeader title="Stress Insight" subtitle="Current Financial Position & Job Loss Impact" />
        <div style={{ padding: '2rem', textAlign: 'center', color: COLORS.MUTED }}>
          Loading your financial snapshot...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ background: COLORS.BG_LIGHT, minHeight: '100vh', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
        <PageHeader title="Stress Insight" subtitle="Current Financial Position & Job Loss Impact" />
        <div style={{ background: '#EFF6FF', border: `1px solid #BFDBFE`, borderLeft: `3px solid ${COLORS.BLUE}`, borderRadius: '0 12px 12px 0', color: '#1E3A8A', padding: '1rem 1.25rem', margin: '1.5rem 2rem' }}>
          ❌ {error || 'No data available'}
        </div>
      </div>
    );
  }

  const survivalYears = Math.floor(data.survival_months / 12);
  const survivalMonths = data.survival_months % 12;

  return (
    <div style={{ background: COLORS.BG_LIGHT, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <PageHeader title="Stress Insight" subtitle="Current Financial Position & Job Loss Impact" />

      <div style={{ padding: '1.5rem 2rem 3rem' }}>
        <SectionLabel text="Starting Position" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.2rem',
            marginBottom: '1.5rem',
          }}
        >
          <KPICard label="Net Worth" value={`₹${(data.net_worth / 1000000).toFixed(1)}Cr`} accent={COLORS.BLUE} icon="💎" />
          <KPICard label="Total Assets" value={`₹${(data.total_assets / 1000000).toFixed(1)}Cr`} accent={COLORS.POSITIVE} icon="📈" />
          <KPICard label="Total Liabilities" value={`₹${(data.total_liabilities / 1000000).toFixed(1)}Cr`} accent={COLORS.NEGATIVE} icon="📉" />
          <KPICard label="Monthly Expense" value={`₹${(data.monthly_expense / 100000).toFixed(1)}L`} accent={COLORS.AMBER} icon="💸" />
        </div>

        <SectionLabel text="Job Loss Impact" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <KPICard
            label="Survival Duration (No Income)"
            value={`${survivalYears} yrs ${survivalMonths} mths`}
            subtext={`${data.survival_months} months total`}
            accent={COLORS.AMBER}
            icon="⏱️"
          />
          <StressScore score={data.stress_score} />
        </div>

        <SectionLabel text="Recommendations" />
        <div style={{ background: COLORS.BG_WHITE, border: `1px solid ${COLORS.BORDER}`, borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <h4 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '700', color: COLORS.TEXT, marginBottom: '0.5rem' }}>
                💡 Improve Your Position
              </h4>
              <ul style={{ fontSize: '0.9rem', color: COLORS.TEXT, lineHeight: '1.6', paddingLeft: '1.5rem' }}>
                <li>Increase monthly savings</li>
                <li>Reduce recurring expenses</li>
                <li>Build emergency fund (6-12 months)</li>
                <li>Diversify income sources</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '700', color: COLORS.TEXT, marginBottom: '0.5rem' }}>
                🎯 Priority Actions
              </h4>
              <ul style={{ fontSize: '0.9rem', color: COLORS.TEXT, lineHeight: '1.6', paddingLeft: '1.5rem' }}>
                <li>Pay off high-interest debt</li>
                <li>Refinance liabilities</li>
                <li>Review insurance coverage</li>
                <li>Skill development for job security</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
