import Link from 'next/link'

interface BreadcrumbItem {
  name: string
  href?: string
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="py-3">
      <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true" className="text-gray-300">/</span>}
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="hover:text-[--color-brand-blue] transition-colors">
                {item.name}
              </Link>
            ) : (
              <span className={i === items.length - 1 ? 'text-[--color-brand-blue] font-medium' : ''}>
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
