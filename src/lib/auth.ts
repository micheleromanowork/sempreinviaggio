import bcrypt from 'bcryptjs'
import { db } from './db'
import { users } from './db/schema'
import { eq } from 'drizzle-orm'

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

export async function getUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
  return result[0] ?? null
}

export async function getUserById(id: number) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return result[0] ?? null
}

// Simple brute-force tracking in memory (resets on server restart — acceptable for single-user CMS)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

export function checkBruteForce(ip: string): boolean {
  const entry = loginAttempts.get(ip)
  if (!entry) return true

  const windowMs = 15 * 60 * 1000 // 15 minutes
  if (Date.now() - entry.lastAttempt > windowMs) {
    loginAttempts.delete(ip)
    return true
  }

  return entry.count < 10
}

export function recordFailedLogin(ip: string) {
  const entry = loginAttempts.get(ip) ?? { count: 0, lastAttempt: Date.now() }
  loginAttempts.set(ip, { count: entry.count + 1, lastAttempt: Date.now() })
}

export function clearLoginAttempts(ip: string) {
  loginAttempts.delete(ip)
}
