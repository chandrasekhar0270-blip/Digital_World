'use client'

import Link from 'next/link'
import styles from './credit-debit.module.css'

export default function CreditDebitPage() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <Link href="/finance" className={styles.backButton}>
          ← Back
        </Link>
        <h1 className={styles.title}>Credit vs Debit</h1>
        <p className={styles.subtitle}>Monthly income vs expense flow</p>
      </div>

      <div className={styles.content}>
        {/* Placeholder for Credit vs Debit module */}
        <div className={styles.moduleContainer}>
          <div className={styles.placeholderCard}>
            <div className={styles.placeholderIcon}>📊</div>
            <h2>Credit vs Debit Module</h2>
            <p>Detailed analysis of your income and expense flows</p>
            <p className={styles.comingSoon}>Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
