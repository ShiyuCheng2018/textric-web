import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Nav } from '@/components/nav'
import './globals.css'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Textric — Text Layout for AI',
  description: 'Line wrapping, rich text, and precise metrics — pure JS, no browser. Interactive demos.',
  metadataBase: new URL('https://textric-web-production.up.railway.app'),
  openGraph: {
    title: 'Textric — Text Layout for AI',
    description: 'Line wrapping, rich text, and precise metrics — pure JS, no browser. Interactive demos.',
    siteName: 'Textric',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Textric — Text Layout for AI',
    description: 'Line wrapping, rich text, and precise metrics — pure JS, no browser.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('dark h-full', geist.variable, geistMono.variable)}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans antialiased">
        <Nav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
