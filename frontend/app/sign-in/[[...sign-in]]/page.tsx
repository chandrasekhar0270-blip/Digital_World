'use client'

import { SignIn } from '@clerk/nextjs'
import styles from './signin.module.css'

export default function SignInPage() {
  return (
    <div className={styles.container}>
      {/* Decorative background elements */}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />

      <div className={styles.content}>
        <div className={`${styles.branding} slide-up`}>
          <div className={styles.logoMark}>DW</div>
          <h1 className={styles.title}>Digital World</h1>
          <p className={styles.subtitle}>Your unified Life OS</p>
        </div>

        <div className={`${styles.formWrapper} slide-up delay-2`}>
          <SignIn
            appearance={{
              elements: {
                rootBox: styles.clerkRoot,
                card: styles.clerkCard,
              },
            }}
            redirectUrl="/dashboard"
            signUpUrl="/sign-up"
          />
        </div>

        <p className={`${styles.footer} slide-up delay-4`}>
          Don&apos;t have an account?{' '}
          <a href="/sign-up">Create one</a>
        </p>
      </div>
    </div>
  )
}