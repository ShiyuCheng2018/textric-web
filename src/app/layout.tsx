import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Nav } from '@/components/nav'
import './globals.css'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Textric Demo — Text Layout for AI',
  description: 'Interactive demos for Textric: line wrapping, rich text, precise metrics — pure JS, no browser.',
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
