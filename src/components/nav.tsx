import Link from 'next/link'

const demos = [
  { href: '/demo/og-image', label: 'OG Image' },
  { href: '/demo/price-tag', label: 'Price Tag' },
  { href: '/demo/email-preflight', label: 'Email Preflight' },
  { href: '/demo/svg-typography', label: 'SVG Typography' },
  { href: '/demo/playground', label: 'Playground' },
  { href: '/demo/wrap-visualizer', label: 'Wrap Visualizer' },
  { href: '/demo/benchmark', label: 'Benchmark' },
]

export function Nav() {
  return (
    <nav className="flex items-center gap-6 px-6 h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <Link href="/" className="font-semibold text-lg tracking-tight">
        Textric
      </Link>
      <div className="flex gap-4 overflow-x-auto text-sm">
        {demos.map(d => (
          <Link key={d.href} href={d.href} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 whitespace-nowrap">
            {d.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
