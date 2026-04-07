'use client'

import Link from 'next/link'
import styles from '../credit-debit/credit-debit.module.css'

export default function FinancialTwinPage() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <Link href="/finance" className={styles.backButton}>
          ← Back
        </Link>
        <h1 className={styles.title}>Financial Twin</h1>
        <p className={styles.subtitle}>Scenario & job loss stress test</p>
      </div>

      <div className={styles.content}>
        <div className={styles.moduleContainer}>
          <div className={styles.placeholderCard}>
            <div className={styles.placeholderIcon}>🎯</div>
            <h2>Financial Twin</h2>
            <p>Run scenarios and stress tests for your finances</p>
            <p className={styles.comingSoon}>Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
