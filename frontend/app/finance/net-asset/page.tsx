'use client'

import Link from 'next/link'
import styles from '../credit-debit/credit-debit.module.css'

export default function NetAssetPage() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <Link href="/finance" className={styles.backButton}>
          ← Back
        </Link>
        <h1 className={styles.title}>Net Asset Scoreboard</h1>
        <p className={styles.subtitle}>Full net worth snapshot</p>
      </div>

      <div className={styles.content}>
        <div className={styles.moduleContainer}>
          <div className={styles.placeholderCard}>
            <div className={styles.placeholderIcon}>💼</div>
            <h2>Net Asset Scoreboard</h2>
            <p>Complete overview of your net worth and assets</p>
            <p className={styles.comingSoon}>Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
