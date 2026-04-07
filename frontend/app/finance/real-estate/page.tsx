'use client'

import Link from 'next/link'
import styles from '../credit-debit/credit-debit.module.css'

export default function RealEstatePage() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <Link href="/finance" className={styles.backButton}>
          ← Back
        </Link>
        <h1 className={styles.title}>Real Estate</h1>
        <p className={styles.subtitle}>Property assets & valuations</p>
      </div>

      <div className={styles.content}>
        <div className={styles.moduleContainer}>
          <div className={styles.placeholderCard}>
            <div className={styles.placeholderIcon}>🏠</div>
            <h2>Real Estate Module</h2>
            <p>Track and value your property assets</p>
            <p className={styles.comingSoon}>Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
