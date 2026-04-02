import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
    description: 'Run 1K-20K measurements. See real throughput.',
    tag: 'Interactive',
  },
]

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-20">
        <h1 className="text-5xl font-bold tracking-tighter font-mono">textric</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
          Text layout for AI. Line wrapping, rich text, and precise metrics — pure JS, no browser.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <a href="https://github.com/ShiyuCheng2018/textric" target="_blank"
            className="inline-flex items-center justify-center h-8 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors">
            GitHub
          </a>
          <a href="https://www.npmjs.com/package/textric" target="_blank"
            className="inline-flex items-center justify-center h-8 px-4 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
            <code className="text-xs font-mono">npm i textric</code>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {demos.map(demo => (
          <Link key={demo.href} href={demo.href} className="group">
            <Card className="h-full transition-colors border-border/50 hover:border-border group-hover:bg-card">
              <CardHeader className="p-4">
                <div className="mb-2">
                  <Badge variant={demo.tag === 'Showcase' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                    {demo.tag}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-medium">{demo.title}</CardTitle>
                <CardDescription className="text-xs">{demo.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
