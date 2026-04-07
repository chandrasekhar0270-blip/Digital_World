'use client'

import { useAuth, useUser, UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import styles from './dashboard.module.css'

/* ─── Product Card Data ─── */
const products = [
  {
    id: 'work',
    name: 'Work',
    tagline: 'Project Management',
    description: 'Plan sprints, track tasks, and ship faster with AI-powered project intelligence.',
    icon: '⚡',
    href: '/work',
    colorVar: '--color-work',
    mutedVar: '--color-work-muted',
    status: 'Coming Soon',
  },
  {
    id: 'money',
    name: 'Money',
    tagline: 'Financial Twin',
    description: 'Track net worth, model scenarios, and build wealth with your AI financial advisor.',
    icon: '💰',
    href: '/finance',
    colorVar: '--color-money',
    mutedVar: '--color-money-muted',
    status: 'Active',
  },
  {
    id: 'health',
    name: 'Health',
    tagline: 'Fitness Coach · RunPulse',
    description: 'Log runs, analyze performance trends, and get AI coaching for your next PB.',
    icon: '🏃',
    href: '/health',
    colorVar: '--color-health',
    mutedVar: '--color-health-muted',
    status: 'Coming Soon',
  },
]

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || !isSignedIn) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
      </div>
    )
  }

  const firstName = user?.firstName || 'there'

  return (
    <div className={styles.page}>
      {/* ─── Top Bar ─── */}
      <header className={`${styles.header} fade-in`}>
        <div className={styles.headerLeft}>
          <div className={styles.logoMark}>DW</div>
          <span className={styles.logoText}>Digital World</span>
        </div>
        <div className={styles.headerRight}>
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: { width: 36, height: 36 },
              },
            }}
          />
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <main className={styles.main}>
        <section className={`${styles.hero} slide-up`}>
          <h1 className={styles.greeting}>
            Welcome back, <span className={styles.name}>{firstName}</span>
          </h1>
          <p className={styles.heroSub}>
            Your Life OS dashboard — manage work, money, and health from one place.
          </p>
        </section>

        {/* ─── Product Cards Grid ─── */}
        <div className={styles.grid}>
          {products.map((product, index) => (
            <button
              key={product.id}
              className={`${styles.card} slide-up delay-${index + 2}`}
              onClick={() => {
                if (product.status === 'Active') {
                  router.push(product.href)
                }
              }}
              disabled={product.status !== 'Active'}
              style={{
                '--card-color': `var(${product.colorVar})`,
                '--card-muted': `var(${product.mutedVar})`,
              } as React.CSSProperties}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>{product.icon}</span>
                <span
                  className={`${styles.badge} ${
                    product.status === 'Active' ? styles.badgeActive : styles.badgeSoon
                  }`}
                >
                  {product.status}
                </span>
              </div>

              <h2 className={styles.cardTitle}>{product.name}</h2>
              <p className={styles.cardTagline}>{product.tagline}</p>
              <p className={styles.cardDesc}>{product.description}</p>

              <div className={styles.cardFooter}>
                <span className={styles.cardCta}>
                  {product.status === 'Active' ? 'Open →' : 'Launching soon'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* ─── Quick Stats Placeholder ─── */}
        <section className={`${styles.statsBar} slide-up delay-5`}>
          <div className={styles.stat}>
            <span className={styles.statValue}>3</span>
            <span className={styles.statLabel}>Modules</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>1</span>
            <span className={styles.statLabel}>Active</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>∞</span>
            <span className={styles.statLabel}>Potential</span>
          </div>
        </section>
      </main>
    </div>
  )
}