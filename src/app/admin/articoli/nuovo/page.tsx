import { db } from '@/lib/db'
import { categories, tags, destinations } from '@/lib/db/schema'
import ArticleEditor from '@/components/admin/ArticleEditor'

export default async function NewArticlePage() {
  const [cats, tgs, dests] = await Promise.all([
    db.select().from(categories).orderBy(categories.name).catch(() => []),
    db.select().from(tags).orderBy(tags.name).catch(() => []),
    db.select().from(destinations).orderBy(destinations.name).catch(() => []),
  ])

  return (
    <ArticleEditor
      categories={cats}
      tags={tgs}
      destinations={dests}
    />
  )
}
