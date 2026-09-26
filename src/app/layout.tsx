import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s — Sempre in Viaggio',
    default: 'Sempre in Viaggio — Blog di viaggio',
  },
  description: 'Il blog di viaggio di Michele Romano: destinazioni, itinerari, cicloviaggi e consigli per viaggiare meglio.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sempreinviaggio.info'),
  authors: [{ name: 'Michele Romano' }],
  creator: 'Michele Romano',
  openGraph: {
    siteName: 'Sempre in Viaggio',
    locale: 'it_IT',
    type: 'website',
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="it"
      className={`${inter.variable} ${playfair.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-white text-[--color-brand-text] antialiased">
        {children}
      </body>
    </html>
  )
}
