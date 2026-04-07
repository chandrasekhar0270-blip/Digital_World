'use client'

import { SignUp } from '@clerk/nextjs'
import styles from './signup.module.css'

export default function SignUpPage() {
  return (
    <div className={styles.container}>
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />

      <div className={styles.content}>
        <div className={`${styles.branding} slide-up`}>
          <div className={styles.logoMark}>DW</div>
          <h1 className={styles.title}>Join Digital World</h1>
          <p className={styles.subtitle}>Work · Money · Health — all in one place</p>
        </div>

        <div className={`${styles.formWrapper} slide-up delay-2`}>
          <SignUp
            appearance={{
              elements: {
                rootBox: styles.clerkRoot,
                card: styles.clerkCard,
              },
            }}
            redirectUrl="/dashboard"
            signInUrl="/sign-in"
          />
        </div>

        <p className={`${styles.footer} slide-up delay-4`}>
          Already have an account?{' '}
          <a href="/sign-in">Sign in</a>
        </p>
      </div>
    </div>
  )
}