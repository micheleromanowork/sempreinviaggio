import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface ArticleCardProps {
  title: string
  slug: string
  excerpt?: string | null
  coverImage?: string | null
  publishedAt: Date | null
  categoryName?: string | null
  articleType?: string
}

export default function ArticleCard({
  title, slug, excerpt, coverImage, publishedAt, categoryName, articleType
}: ArticleCardProps) {
  return (
    <article className="group flex flex-col rounded-lg overflow-hidden shadow-[var(--shadow-card)] bg-white hover:shadow-[var(--shadow-lg)] transition-shadow duration-300">
      <Link href={`/articoli/${slug}`} className="block relative aspect-[16/9] bg-gray-100 overflow-hidden" tabIndex={-1}>
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[--color-brand-blue] to-[--color-brand-blue-light] flex items-center justify-center">
            <span className="text-white/30 text-4xl font-serif">SV</span>
          </div>
        )}
        {articleType && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[--color-brand-coral] text-xs font-semibold px-2 py-1 rounded capitalize">
            {articleType}
          </span>
        )}
      </Link>
      <div className="flex flex-col flex-1 p-5">
        {categoryName && (
          <p className="text-xs font-semibold text-[--color-brand-coral] uppercase tracking-wider mb-2">{categoryName}</p>
        )}
        <h3 className="font-serif font-bold text-[--color-brand-blue] text-lg leading-tight mb-2 group-hover:text-[--color-brand-coral] transition-colors">
          <Link href={`/articoli/${slug}`}>{title}</Link>
        </h3>
        {excerpt && (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">{excerpt}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          {publishedAt && (
            <time className="text-xs text-gray-400" dateTime={publishedAt.toISOString()}>
              {format(publishedAt, 'd MMMM yyyy', { locale: it })}
            </time>
          )}
          <Link
            href={`/articoli/${slug}`}
            className="text-xs font-semibold text-[--color-brand-blue] hover:text-[--color-brand-coral] transition-colors"
          >
            Leggi →
          </Link>
        </div>
      </div>
    </article>
  )
}
