'use client';

import React, { useState } from 'react';
import StressInsightPage from './stress-insight';
import TwinAPage from './twin-a';
import TwinComparisonPage from './twin-comparison';

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

const navOptions = [
  { icon: '🧠', label: 'Stress Insight', key: 'stress-insight' as const },
  { icon: '📈', label: 'See Twin A', key: 'twin-a' as const },
  { icon: '⚖️', label: 'Twin A vs Twin B', key: 'twin-comparison' as const },
];

export default function JobLossStressTest() {
  const [currentPage, setCurrentPage] = useState<'stress-insight' | 'twin-a' | 'twin-comparison'>('stress-insight');

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

      {/* Navigation Header */}
      <div
        style={{
          background: COLORS.BG_WHITE,
          borderBottom: `1px solid ${COLORS.BORDER}`,
          padding: '0.9rem 2rem 0',
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: '700',
            color: '#94A3B8',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '0.6rem',
          }}
        >
          🧠 Job Loss Stress Test · Select View
        </div>

        {/* Navigation Buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            marginBottom: '0.5rem',
          }}
        >
          {navOptions.map((option) => {
            const isActive = currentPage === option.key;
            return (
              <button
                key={option.key}
                onClick={() => setCurrentPage(option.key)}
                style={{
                  padding: '0.6rem 1.2rem',
                  border: `1.5px solid ${COLORS.BORDER}`,
                  borderRadius: '10px',
                  background: isActive
                    ? `linear-gradient(135deg, ${COLORS.BLUE}, ${COLORS.BLUE_LT})`
                    : COLORS.BG_WHITE,
                  color: isActive ? '#FFFFFF' : COLORS.BLUE,
                  fontSize: '0.82rem',
                  fontWeight: isActive ? '700' : '600',
                  fontFamily: "'Inter', sans-serif",
                  cursor: 'pointer',
                  transition: 'all 0.16s',
                  textAlign: 'center',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.target as HTMLButtonElement).style.background = '#EFF6FF';
                    (e.target as HTMLButtonElement).style.borderColor = COLORS.BLUE;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.target as HTMLButtonElement).style.background = COLORS.BG_WHITE;
                    (e.target as HTMLButtonElement).style.borderColor = COLORS.BORDER;
                  }
                }}
              >
                {option.icon} {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Content */}
      <div>
        {currentPage === 'stress-insight' && <StressInsightPage />}
        {currentPage === 'twin-a' && <TwinAPage />}
        {currentPage === 'twin-comparison' && <TwinComparisonPage />}
      </div>
    </div>
  );
}
