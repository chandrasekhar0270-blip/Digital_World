import { neon } from '@neondatabase/serverless'

/**
 * Returns a Neon SQL tagged-template function.
 * Uses DATABASE_URL from env (same as RunPulse pattern).
 */
export function getSQL() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set in environment variables')
  }
  return neon(databaseUrl)
}

/**
 * Format Indian Rupees with lakhs/crores notation.
 */
export function formatINR(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`
  if (abs >= 100_000) return `₹${(amount / 100_000).toFixed(2)} L`
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}
