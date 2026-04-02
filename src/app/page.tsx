import Link from 'next/link'

const demos = [
  {
    href: '/demo/og-image',
    title: 'OG Image Generator',
    description: 'Preview social card layout with fitText auto-scaling.',
    tag: 'Showcase',
  },
  {
    href: '/demo/price-tag',
    title: 'Price Tag Builder',
    description: 'Mixed font sizes with rich text. Drag to reflow.',
    tag: 'Showcase',
  },
  {
    href: '/demo/email-preflight',
    title: 'Email Template Preflight',
    description: 'Check if text fits in fixed-width email containers.',
    tag: 'Showcase',
  },
  {
    href: '/demo/svg-typography',
    title: 'SVG Typography',
    description: 'Rich text to SVG with baseline alignment visualization.',
    tag: 'Showcase',
  },
  {
    href: '/demo/playground',
    title: 'Measurement Playground',
    description: 'Input text, tweak parameters, see results live.',
    tag: 'Interactive',
  },
  {
    href: '/demo/wrap-visualizer',
    title: 'Wrap Visualizer',
    description: 'Visualize line-break decisions and per-line widths.',
    tag: 'Interactive',
  },
  {
    href: '/demo/benchmark',
    title: 'Performance Benchmark',
    description: 'Run 1K–20K measurements. See real throughput.',
    tag: 'Interactive',
  },
]

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight">Textric</h1>
        <p className="mt-3 text-lg text-zinc-500">
          Text layout for AI. Line wrapping, rich text, and precise metrics — pure JS, no browser.
        </p>
        <div className="mt-6 flex justify-center gap-4 text-sm">
          <a href="https://github.com/ShiyuCheng2018/textric" target="_blank"
            className="px-4 py-2 rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium hover:opacity-90">
            GitHub
          </a>
          <a href="https://www.npmjs.com/package/textric" target="_blank"
            className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900">
            npm install textric
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {demos.map(demo => (
          <Link key={demo.href} href={demo.href}
            className="block p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                demo.tag === 'Showcase'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
              }`}>{demo.tag}</span>
            </div>
            <h2 className="font-semibold">{demo.title}</h2>
            <p className="text-sm text-zinc-500 mt-1">{demo.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
