'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const demos = [
  { href: '/demo/poster-editor', label: 'Poster Editor' },
  { href: '/demo/chat-bubble', label: 'Chat Bubble' },
  { href: '/demo/price-tag', label: 'Price Tag' },
  { href: '/demo/email-preflight', label: 'Email Preflight' },
  { href: '/demo/svg-typography', label: 'SVG Typography' },
  { href: '/demo/playground', label: 'Playground' },
  { href: '/demo/wrap-visualizer', label: 'Wrap Visualizer' },
  { href: '/demo/benchmark', label: 'Benchmark' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 flex items-center gap-6 px-6 h-12 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <Link href="/" className="font-semibold text-sm tracking-tight font-mono">
        textric
      </Link>
      <div className="flex gap-1 overflow-x-auto text-[13px]">
        {demos.map(d => (
          <Link
            key={d.href}
            href={d.href}
            className={cn(
              'px-2.5 py-1 rounded-md whitespace-nowrap transition-colors',
              pathname === d.href
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
          >
            {d.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
