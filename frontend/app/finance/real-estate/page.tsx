'use client'

import Link from 'next/link'

const modules = [
  {
    id: 'asset-valuation',
    icon: '📊',
    title: 'Asset Valuation',
    subtitle: 'Property values, sqft rates & portfolio worth',
    href: '/finance/real-estate/asset-valuation',
    accent: '#2563EB',
    tags: ['Built Plot', 'Land', 'Market Value'],
  },
  {
    id: 'cost-analysis',
    icon: '🧾',
    title: 'Cost Analysis',
    subtitle: 'Purchase cost, loan breakdown & interest paid',
    href: '/finance/real-estate/cost-analysis',
    accent: '#DC2626',
    tags: ['Down Payment', 'Bank Loan', 'Interest'],
  },
]

export default function RealEstateHub() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fde68a 100%)', fontFamily: 'Inter, sans-serif', padding: '40px 20px' }}>

      {/* Back link */}
      <div style={{ maxWidth: 1000, margin: '0 auto 32px' }}>
        <Link href="/finance" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#64748B', textDecoration: 'none', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 12px' }}>
          ← Back to Finance
        </Link>
      </div>

      {/* Header */}
      <div style={{ maxWidth: 1000, margin: '0 auto 48px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #DC2626, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(220,38,38,0.25)' }}>🏠</div>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: '#1E293B', margin: '0 0 10px', letterSpacing: '-0.5px' }}>Real Estate</h1>
        <p style={{ fontSize: 16, color: '#64748B', margin: 0, fontWeight: 500 }}>Property portfolio intelligence — valuation, cost breakdown & record management</p>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 24 }}>
        {modules.map(m => (
          <Link key={m.id} href={m.href} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: 18,
              padding: '28px 24px',
              border: '2px solid transparent',
              borderTop: `4px solid ${m.accent}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              cursor: 'pointer',
              minHeight: 240,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              {/* Icon */}
              <div>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${m.accent}15`, border: `1px solid ${m.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: 18 }}>
                  {m.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', margin: '0 0 8px', letterSpacing: '-0.3px' }}>{m.title}</h3>
                <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 20px', lineHeight: 1.6 }}>{m.subtitle}</p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {m.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '0.65rem', fontWeight: 600, color: m.accent, background: `${m.accent}10`, border: `1px solid ${m.accent}25`, borderRadius: 20, padding: '3px 10px' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: m.accent }}>Open →</span>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
