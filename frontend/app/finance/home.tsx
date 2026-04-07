'use client'

import Link from 'next/link'
import styles from './home.module.css'

export default function FinanceHome() {
  const products = [
    {
      id: 'credit-debit',
      icon: '📊',
      title: 'Credit vs Debit',
      subtitle: 'Monthly income vs expense flow',
      href: '/finance/credit-debit',
      accentColor: '#2563EB',
    },
    {
      id: 'real-estate',
      icon: '🏠',
      title: 'Real Estate',
      subtitle: 'Property assets & valuations',
      href: '/finance/real-estate',
      accentColor: '#DC2626',
    },
    {
      id: 'net-asset',
      icon: '💼',
      title: 'Net Asset Scoreboard',
      subtitle: 'Full net worth snapshot',
      href: '/finance/net-asset',
      accentColor: '#9333EA',
    },
    {
      id: 'financial-twin',
      icon: '🎯',
      title: 'Financial Twin',
      subtitle: 'Scenario & job loss stress test',
      href: '/finance/financial-twin',
      accentColor: '#059669',
    },
  ]

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Financial Twin</h1>
        <p className={styles.subtitle}>Master your money with intelligent financial tools</p>
      </div>

      {/* Products Grid */}
      <div className={styles.grid}>
        {products.map((product) => (
          <Link
            key={product.id}
            href={product.href}
            className={styles.productCard}
            style={{ '--accent-color': product.accentColor } as React.CSSProperties}
          >
            <div className={styles.cardTop}>
              <div className={styles.icon}>{product.icon}</div>
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.productTitle}>{product.title}</h3>
              <p className={styles.productSubtitle}>{product.subtitle}</p>
            </div>
            <div className={styles.cardBottom}>
              <span className={styles.openLink}>Open →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
