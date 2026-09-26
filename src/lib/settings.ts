import { db } from './db'
import { settings } from './db/schema'
import { eq, inArray } from 'drizzle-orm'

export async function getSetting(key: string): Promise<string | null> {
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1)
  return result[0]?.value ?? null
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const result = await db.select().from(settings).where(inArray(settings.key, keys))
  return Object.fromEntries(result.map(r => [r.key, r.value]))
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } })
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const result = await db.select().from(settings)
  return Object.fromEntries(result.map(r => [r.key, r.value]))
}
