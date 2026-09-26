'use client'

interface Props {
  title: string
  metaDescription: string
  slug: string
  coverImage: string
  content: string
}

interface Check {
  label: string
  ok: boolean
  warn: boolean
  msg?: string
}

export default function SeoChecker({ title, metaDescription, slug, coverImage, content }: Props) {
  const checks: Check[] = [
    { label: 'Titolo presente', ok: title.length > 0, warn: false },
    { label: 'Titolo ottimale (50-60 car.)', ok: title.length >= 50 && title.length <= 60, warn: title.length > 0 && (title.length < 50 || title.length > 60), msg: `${title.length} caratteri` },
    { label: 'Meta description presente', ok: metaDescription.length > 0, warn: false },
    { label: 'Meta description ottimale (130-155 car.)', ok: metaDescription.length >= 130 && metaDescription.length <= 155, warn: metaDescription.length > 0 && (metaDescription.length < 130 || metaDescription.length > 155), msg: `${metaDescription.length} caratteri` },
    { label: 'Slug valido', ok: /^[a-z0-9-]+$/.test(slug), warn: false },
    { label: 'Immagine di copertina', ok: coverImage.length > 0, warn: false },
    { label: 'Contenuto H2 presente', ok: content.includes('<h2'), warn: false },
  ]

  return (
    <div className="space-y-1.5">
      {checks.map(c => (
        <div key={c.label} className="flex items-start gap-2 text-sm">
          <span className={`mt-0.5 shrink-0 ${c.ok ? 'text-green-500' : c.warn ? 'text-yellow-500' : 'text-gray-300'}`}>
            {c.ok ? '✓' : c.warn ? '⚠' : '○'}
          </span>
          <span className={c.ok ? 'text-gray-700' : c.warn ? 'text-yellow-700' : 'text-gray-400'}>
            {c.label}
            {c.msg && <span className="ml-1 text-xs text-gray-400">({c.msg})</span>}
          </span>
        </div>
      ))}
    </div>
  )
}
