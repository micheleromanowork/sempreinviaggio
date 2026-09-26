import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { articles } from '@/lib/db/schema'
import { eq, and, lte } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  }

  const now = new Date()
  const scheduled = await db
    .select()
    .from(articles)
    .where(and(eq(articles.status, 'scheduled'), lte(articles.scheduledAt, now)))

  if (scheduled.length === 0) {
    return NextResponse.json({ published: 0 })
  }

  for (const article of scheduled) {
    await db
      .update(articles)
      .set({ status: 'published', publishedAt: now })
      .where(eq(articles.id, article.id))
  }

  return NextResponse.json({ published: scheduled.length })
}
