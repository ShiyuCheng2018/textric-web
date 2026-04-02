import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Nav } from '@/components/nav'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Textric Demo — Text Layout for AI',
  description: 'Interactive demos for Textric: line wrapping, rich text, precise metrics — pure JS, no browser.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <Nav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
