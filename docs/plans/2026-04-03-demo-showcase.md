# Textric Demo Showcase Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Next.js demo showcase site with 7 interactive demos that visually demonstrate Textric's text layout capabilities.

**Architecture:** Next.js App Router with Server Actions calling Textric on the server. Each demo is a route under `/demo/[name]`. A shared `DemoShell` component provides consistent layout (controls panel + preview area). Font files (Inter Regular/Bold) are bundled in `public/fonts/`. User font upload goes through a Server Action that loads it into a per-request measurer.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, textric 2.0.0

---

## Task 1: Foundation — layout, navigation, fonts, textric server util

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Create: `src/lib/textric.ts` (server-side textric singleton)
- Create: `src/components/nav.tsx`
- Create: `public/fonts/Inter-Regular.ttf`
- Create: `public/fonts/Inter-Bold.ttf`

**Step 1: Copy Inter font files into public/fonts/**

```bash
mkdir -p public/fonts
cp /Users/shiyucheng/MyProjects/Textric/test/fixtures/fonts/Inter-Regular.ttf public/fonts/
cp /Users/shiyucheng/MyProjects/Textric/test/fixtures/fonts/Inter-Bold.ttf public/fonts/
```

**Step 2: Create server-side textric singleton**

Create `src/lib/textric.ts`:
```ts
import { createMeasurer } from 'textric'
import { readFile } from 'fs/promises'
import { join } from 'path'

let measurerPromise: ReturnType<typeof createMeasurer> | null = null

export async function getMeasurer() {
  if (!measurerPromise) {
    measurerPromise = createMeasurer({
      fonts: [
        { family: 'Inter', data: await readFile(join(process.cwd(), 'public/fonts/Inter-Regular.ttf')), weight: 400 },
        { family: 'Inter', data: await readFile(join(process.cwd(), 'public/fonts/Inter-Bold.ttf')), weight: 700 },
      ],
    })
  }
  return measurerPromise
}
```

**Step 3: Create navigation component**

Create `src/components/nav.tsx`:
```tsx
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
```

**Step 4: Update layout.tsx**

Replace `src/app/layout.tsx`:
```tsx
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
```

**Step 5: Simplify globals.css**

Replace `src/app/globals.css`:
```css
@import "tailwindcss";
```

**Step 6: Verify**

Run: `cd /Users/shiyucheng/MyProjects/textric-demo && pnpm dev`
Open: http://localhost:3000
Expected: Page with "Textric" nav bar and demo links

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: foundation — layout, nav, fonts, textric server util"
```

---

## Task 2: Shared DemoShell component

**Files:**
- Create: `src/components/demo-shell.tsx`

**Step 1: Create DemoShell**

This provides consistent layout for all demos: title + description on top, controls on left, preview on right.

Create `src/components/demo-shell.tsx`:
```tsx
interface DemoShellProps {
  title: string
  description: string
  controls: React.ReactNode
  preview: React.ReactNode
}

export function DemoShell({ title, description, controls, preview }: DemoShellProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-zinc-500 mt-1">{description}</p>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 shrink-0 border-r border-zinc-200 dark:border-zinc-800 p-4 overflow-y-auto space-y-4">
          {controls}
        </div>
        <div className="flex-1 p-6 overflow-auto flex items-start justify-center">
          {preview}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Verify**

Run: `pnpm build`
Expected: Compiles without error

**Step 3: Commit**

```bash
git add src/components/demo-shell.tsx
git commit -m "feat: add DemoShell shared layout component"
```

---

## Task 3: Demo — Text Measurement Playground

This is the simplest demo and establishes the full pattern: Server Action + client state + live preview.

**Files:**
- Create: `src/app/demo/playground/page.tsx`
- Create: `src/app/demo/playground/actions.ts`

**Step 1: Create Server Action**

Create `src/app/demo/playground/actions.ts`:
```ts
'use server'

import { getMeasurer } from '@/lib/textric'

export async function measureText(formData: {
  text: string
  size: number
  weight: number
  maxWidth: number | null
  lineHeight: number
}) {
  const m = await getMeasurer()

  if (formData.maxWidth) {
    const result = m.measure(formData.text, {
      font: 'Inter',
      size: formData.size,
      weight: formData.weight,
      maxWidth: formData.maxWidth,
      lineHeight: formData.lineHeight,
    })
    return {
      mode: 'multi' as const,
      width: result.width,
      height: result.height,
      lines: result.lines,
      lineWidths: result.lineWidths,
      lineCount: result.lineCount,
      truncated: result.truncated,
    }
  }

  const result = m.measure(formData.text, {
    font: 'Inter',
    size: formData.size,
    weight: formData.weight,
    lineHeight: formData.lineHeight,
  })
  return {
    mode: 'single' as const,
    width: result.width,
    height: result.height,
    ascent: result.ascent,
    descent: result.descent,
  }
}
```

**Step 2: Create the page component**

Create `src/app/demo/playground/page.tsx`:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { measureText } from './actions'

type MeasureResult = Awaited<ReturnType<typeof measureText>>

export default function PlaygroundPage() {
  const [text, setText] = useState('Hello World, this is Textric!')
  const [size, setSize] = useState(16)
  const [weight, setWeight] = useState(400)
  const [maxWidth, setMaxWidth] = useState<number | null>(300)
  const [lineHeight, setLineHeight] = useState(1.2)
  const [result, setResult] = useState<MeasureResult | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      measureText({ text, size, weight, maxWidth, lineHeight }).then(setResult)
    }, 100)
    return () => clearTimeout(timer)
  }, [text, size, weight, maxWidth, lineHeight])

  return (
    <DemoShell
      title="Text Measurement Playground"
      description="Input text, adjust parameters, see measurement results in real-time."
      controls={
        <>
          <label className="block">
            <span className="text-sm font-medium">Text</span>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Font Size: {size}px</span>
            <input type="range" min={8} max={72} value={size} onChange={e => setSize(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Weight</span>
            <select value={weight} onChange={e => setWeight(+e.target.value)}
              className="mt-1 block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm">
              <option value={400}>Regular (400)</option>
              <option value={700}>Bold (700)</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Max Width: {maxWidth ?? 'none'}</span>
            <input type="range" min={50} max={800} value={maxWidth ?? 800} onChange={e => setMaxWidth(+e.target.value)}
              className="mt-1 block w-full" />
            <button onClick={() => setMaxWidth(maxWidth ? null : 300)} className="text-xs text-blue-500 mt-1">
              {maxWidth ? 'Disable' : 'Enable'} maxWidth
            </button>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Line Height: {lineHeight}</span>
            <input type="range" min={0.8} max={3} step={0.1} value={lineHeight} onChange={e => setLineHeight(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
        </>
      }
      preview={
        <div className="space-y-4 w-full max-w-2xl">
          {result && (
            <>
              <div className="text-sm font-mono bg-zinc-100 dark:bg-zinc-900 rounded p-4 space-y-1">
                <div>width: <span className="text-blue-600">{result.width.toFixed(2)}px</span></div>
                <div>height: <span className="text-blue-600">{result.height.toFixed(2)}px</span></div>
                {result.mode === 'multi' && (
                  <>
                    <div>lineCount: <span className="text-blue-600">{result.lineCount}</span></div>
                    <div>truncated: <span className="text-blue-600">{String(result.truncated)}</span></div>
                  </>
                )}
                {result.mode === 'single' && (
                  <>
                    <div>ascent: <span className="text-blue-600">{result.ascent.toFixed(2)}px</span></div>
                    <div>descent: <span className="text-blue-600">{result.descent.toFixed(2)}px</span></div>
                  </>
                )}
              </div>

              {/* Visual preview */}
              <div className="relative border border-dashed border-zinc-300 dark:border-zinc-700 inline-block">
                {maxWidth && (
                  <div className="absolute top-0 right-0 text-xs text-zinc-400 px-1">
                    {maxWidth}px
                  </div>
                )}
                <svg
                  width={maxWidth ?? result.width + 20}
                  height={result.height + 10}
                  className="block"
                >
                  {result.mode === 'multi' && result.lines.map((line, i) => (
                    <text
                      key={i}
                      x={0}
                      y={(i + 1) * size * lineHeight - size * 0.2}
                      fontSize={size}
                      fontWeight={weight}
                      fontFamily="Inter"
                      fill="currentColor"
                    >
                      {line}
                    </text>
                  ))}
                  {result.mode === 'single' && (
                    <text
                      x={0}
                      y={result.ascent}
                      fontSize={size}
                      fontWeight={weight}
                      fontFamily="Inter"
                      fill="currentColor"
                    >
                      {text}
                    </text>
                  )}
                </svg>
              </div>
            </>
          )}
        </div>
      }
    />
  )
}
```

**Step 3: Verify**

Run: `pnpm dev`
Open: http://localhost:3000/demo/playground
Expected: Left panel with controls, right panel shows measurement data + SVG text preview. Changing text/size/width updates in real-time.

**Step 4: Commit**

```bash
git add src/app/demo/playground/
git commit -m "feat: add Text Measurement Playground demo"
```

---

## Task 4: Demo — Price Tag Builder

**Files:**
- Create: `src/app/demo/price-tag/page.tsx`
- Create: `src/app/demo/price-tag/actions.ts`

**Step 1: Create Server Action**

Create `src/app/demo/price-tag/actions.ts`:
```ts
'use server'

import { getMeasurer } from '@/lib/textric'

export async function measurePriceTag(formData: {
  currency: string
  price: string
  decimals: string
  suffix: string
  mainSize: number
  smallSize: number
  containerWidth: number
}) {
  const m = await getMeasurer()
  const spans = [
    { text: formData.currency, font: 'Inter', size: formData.smallSize, weight: 400 },
    { text: formData.price, font: 'Inter', size: formData.mainSize, weight: 700 },
    { text: formData.decimals, font: 'Inter', size: formData.smallSize, weight: 400 },
  ]
  if (formData.suffix) {
    spans.push({ text: formData.suffix, font: 'Inter', size: formData.smallSize, weight: 400 })
  }

  const result = m.measureRichText(spans, { maxWidth: formData.containerWidth })
  return {
    width: result.width,
    height: result.height,
    lines: result.lines.map(line => ({
      y: line.y,
      baseline: line.baseline,
      height: line.height,
      fragments: line.fragments.map(f => ({
        text: f.text,
        x: f.x,
        width: f.width,
        size: f.size,
        weight: f.weight,
      })),
    })),
  }
}
```

**Step 2: Create the page component**

Create `src/app/demo/price-tag/page.tsx`:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { measurePriceTag } from './actions'

type PriceResult = Awaited<ReturnType<typeof measurePriceTag>>

export default function PriceTagPage() {
  const [currency, setCurrency] = useState('$')
  const [price, setPrice] = useState('49')
  const [decimals, setDecimals] = useState('.99')
  const [suffix, setSuffix] = useState('/mo')
  const [mainSize, setMainSize] = useState(48)
  const [smallSize, setSmallSize] = useState(18)
  const [containerWidth, setContainerWidth] = useState(400)
  const [result, setResult] = useState<PriceResult | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      measurePriceTag({ currency, price, decimals, suffix, mainSize, smallSize, containerWidth }).then(setResult)
    }, 100)
    return () => clearTimeout(timer)
  }, [currency, price, decimals, suffix, mainSize, smallSize, containerWidth])

  return (
    <DemoShell
      title="Price Tag Builder"
      description="Mixed font sizes with rich text layout. Drag the container width to see real-time reflow."
      controls={
        <>
          <label className="block">
            <span className="text-sm font-medium">Currency</span>
            <input value={currency} onChange={e => setCurrency(e.target.value)}
              className="mt-1 block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Price</span>
            <input value={price} onChange={e => setPrice(e.target.value)}
              className="mt-1 block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Decimals</span>
            <input value={decimals} onChange={e => setDecimals(e.target.value)}
              className="mt-1 block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Suffix</span>
            <input value={suffix} onChange={e => setSuffix(e.target.value)}
              className="mt-1 block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Main Size: {mainSize}px</span>
            <input type="range" min={24} max={96} value={mainSize} onChange={e => setMainSize(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Small Size: {smallSize}px</span>
            <input type="range" min={10} max={48} value={smallSize} onChange={e => setSmallSize(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Container: {containerWidth}px</span>
            <input type="range" min={100} max={800} value={containerWidth} onChange={e => setContainerWidth(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
        </>
      }
      preview={
        <div className="space-y-4">
          {result && (
            <>
              <div className="border border-dashed border-zinc-300 dark:border-zinc-700 relative" style={{ width: containerWidth }}>
                <svg width={containerWidth} height={result.height + 10} className="block">
                  {result.lines.map((line, li) =>
                    line.fragments.map((frag, fi) => (
                      <text
                        key={`${li}-${fi}`}
                        x={frag.x}
                        y={line.baseline}
                        fontSize={frag.size}
                        fontWeight={frag.weight}
                        fontFamily="Inter"
                        fill="currentColor"
                      >
                        {frag.text}
                      </text>
                    ))
                  )}
                </svg>
              </div>
              <div className="text-xs font-mono text-zinc-500">
                {result.width.toFixed(1)}px x {result.height.toFixed(1)}px
              </div>
            </>
          )}
        </div>
      }
    />
  )
}
```

**Step 3: Verify**

Open: http://localhost:3000/demo/price-tag
Expected: Price tag rendering with draggable container width, fragments positioned via baseline alignment.

**Step 4: Commit**

```bash
git add src/app/demo/price-tag/
git commit -m "feat: add Price Tag Builder demo"
```

---

## Task 5: Demo — OG Image Generator

**Files:**
- Create: `src/app/demo/og-image/page.tsx`
- Create: `src/app/demo/og-image/actions.ts`

**Step 1: Create Server Action**

Create `src/app/demo/og-image/actions.ts`:
```ts
'use server'

import { getMeasurer } from '@/lib/textric'

export async function layoutOGImage(formData: {
  title: string
  subtitle: string
  titleSize: number
  subtitleSize: number
  width: number
  height: number
  padding: number
}) {
  const m = await getMeasurer()
  const contentWidth = formData.width - formData.padding * 2

  const titleResult = m.measure(formData.title, {
    font: 'Inter', size: formData.titleSize, weight: 700,
    maxWidth: contentWidth, lineHeight: 1.2,
  })

  const subtitleResult = m.measure(formData.subtitle, {
    font: 'Inter', size: formData.subtitleSize, weight: 400,
    maxWidth: contentWidth, lineHeight: 1.4,
  })

  const titleFit = m.fitText(formData.title, {
    font: 'Inter', maxWidth: contentWidth,
    maxHeight: formData.height * 0.5, weight: 700, lineHeight: 1.2,
  })

  return {
    title: {
      lines: titleResult.lines,
      width: titleResult.width,
      height: titleResult.height,
      lineCount: titleResult.lineCount,
    },
    subtitle: {
      lines: subtitleResult.lines,
      width: subtitleResult.width,
      height: subtitleResult.height,
    },
    fitTitle: {
      size: titleFit.size,
      lines: titleFit.lines,
      height: titleFit.height,
    },
    canvas: { width: formData.width, height: formData.height, padding: formData.padding },
  }
}
```

**Step 2: Create the page component**

Create `src/app/demo/og-image/page.tsx`:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { layoutOGImage } from './actions'

type OGResult = Awaited<ReturnType<typeof layoutOGImage>>

export default function OGImagePage() {
  const [title, setTitle] = useState('Textric: Text Layout for AI')
  const [subtitle, setSubtitle] = useState('Line wrapping, rich text, and precise metrics — pure JS, no browser.')
  const [titleSize, setTitleSize] = useState(48)
  const [subtitleSize, setSubtitleSize] = useState(24)
  const [width] = useState(1200)
  const [height] = useState(630)
  const [padding, setPadding] = useState(60)
  const [result, setResult] = useState<OGResult | null>(null)
  const [autoFit, setAutoFit] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      layoutOGImage({ title, subtitle, titleSize, subtitleSize, width, height, padding }).then(setResult)
    }, 150)
    return () => clearTimeout(timer)
  }, [title, subtitle, titleSize, subtitleSize, width, height, padding])

  const scale = 0.5

  return (
    <DemoShell
      title="OG Image Generator"
      description="Preview social card layout with fitText auto-scaling. Textric computes exact line breaks server-side."
      controls={
        <>
          <label className="block">
            <span className="text-sm font-medium">Title</span>
            <textarea value={title} onChange={e => setTitle(e.target.value)} rows={2}
              className="mt-1 block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Subtitle</span>
            <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} rows={2}
              className="mt-1 block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={autoFit} onChange={e => setAutoFit(e.target.checked)} />
            <span className="text-sm font-medium">Auto-fit title size</span>
          </label>
          {!autoFit && (
            <label className="block">
              <span className="text-sm font-medium">Title Size: {titleSize}px</span>
              <input type="range" min={20} max={80} value={titleSize} onChange={e => setTitleSize(+e.target.value)}
                className="mt-1 block w-full" />
            </label>
          )}
          {autoFit && result && (
            <div className="text-sm text-zinc-500">
              fitText chose: <span className="font-mono text-blue-600">{result.fitTitle.size}px</span>
            </div>
          )}
          <label className="block">
            <span className="text-sm font-medium">Subtitle Size: {subtitleSize}px</span>
            <input type="range" min={12} max={40} value={subtitleSize} onChange={e => setSubtitleSize(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Padding: {padding}px</span>
            <input type="range" min={20} max={120} value={padding} onChange={e => setPadding(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
        </>
      }
      preview={
        result && (
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <svg width={width} height={height} className="rounded-lg shadow-lg">
              <rect width={width} height={height} fill="#111827" rx={16} />
              {/* Title */}
              {(autoFit ? result.fitTitle.lines : result.title.lines).map((line, i) => (
                <text key={`t-${i}`}
                  x={padding} y={padding + (i + 1) * (autoFit ? result.fitTitle.size : titleSize) * 1.2 - (autoFit ? result.fitTitle.size : titleSize) * 0.2}
                  fontSize={autoFit ? result.fitTitle.size : titleSize}
                  fontWeight={700} fontFamily="Inter" fill="white">
                  {line}
                </text>
              ))}
              {/* Subtitle */}
              {result.subtitle.lines.map((line, i) => {
                const titleH = autoFit ? result.fitTitle.height : result.title.height
                return (
                  <text key={`s-${i}`}
                    x={padding} y={padding + titleH + 20 + (i + 1) * subtitleSize * 1.4 - subtitleSize * 0.2}
                    fontSize={subtitleSize}
                    fontWeight={400} fontFamily="Inter" fill="#9CA3AF">
                    {line}
                  </text>
                )
              })}
              {/* Branding */}
              <text x={padding} y={height - padding} fontSize={18} fontFamily="Inter" fill="#6B7280">
                textric.dev
              </text>
            </svg>
          </div>
        )
      }
    />
  )
}
```

**Step 3: Verify**

Open: http://localhost:3000/demo/og-image
Expected: 1200x630 social card preview with title + subtitle. Toggle auto-fit to see fitText choose optimal size.

**Step 4: Commit**

```bash
git add src/app/demo/og-image/
git commit -m "feat: add OG Image Generator demo"
```

---

## Task 6: Demo — SVG Typography

**Files:**
- Create: `src/app/demo/svg-typography/page.tsx`
- Create: `src/app/demo/svg-typography/actions.ts`

**Step 1: Create Server Action**

Create `src/app/demo/svg-typography/actions.ts`:
```ts
'use server'

import { getMeasurer } from '@/lib/textric'

export async function layoutRichSVG(formData: {
  spans: Array<{ text: string; size: number; weight: number }>
  maxWidth: number
  lineHeight: number
  showBaselines: boolean
}) {
  const m = await getMeasurer()
  const richSpans = formData.spans.map(s => ({
    text: s.text, font: 'Inter', size: s.size, weight: s.weight,
  }))

  const result = m.measureRichText(richSpans, {
    maxWidth: formData.maxWidth, lineHeight: formData.lineHeight,
  })

  return {
    width: result.width,
    height: result.height,
    lineCount: result.lineCount,
    lines: result.lines.map(line => ({
      y: line.y,
      baseline: line.baseline,
      ascent: line.ascent,
      descent: line.descent,
      height: line.height,
      width: line.width,
      fragments: line.fragments.map(f => ({
        text: f.text, x: f.x, width: f.width,
        size: f.size, weight: f.weight,
      })),
    })),
  }
}
```

**Step 2: Create the page component**

Create `src/app/demo/svg-typography/page.tsx`:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { layoutRichSVG } from './actions'

type SVGResult = Awaited<ReturnType<typeof layoutRichSVG>>

const defaultSpans = [
  { text: 'Dashboard ', size: 28, weight: 700 },
  { text: '/ ', size: 28, weight: 400 },
  { text: 'Analytics ', size: 28, weight: 400 },
  { text: '— Real-time insights for your AI pipeline with detailed metrics and charts.', size: 16, weight: 400 },
]

export default function SVGTypographyPage() {
  const [spans, setSpans] = useState(defaultSpans)
  const [maxWidth, setMaxWidth] = useState(500)
  const [lineHeight, setLineHeight] = useState(1.4)
  const [showBaselines, setShowBaselines] = useState(true)
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true)
  const [result, setResult] = useState<SVGResult | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      layoutRichSVG({ spans, maxWidth, lineHeight, showBaselines }).then(setResult)
    }, 150)
    return () => clearTimeout(timer)
  }, [spans, maxWidth, lineHeight, showBaselines])

  const updateSpan = (i: number, field: string, value: string | number) => {
    setSpans(prev => prev.map((s, j) => j === i ? { ...s, [field]: value } : s))
  }

  return (
    <DemoShell
      title="SVG Typography"
      description="Rich text to SVG rendering with baseline alignment visualization."
      controls={
        <>
          {spans.map((span, i) => (
            <div key={i} className="border border-zinc-200 dark:border-zinc-800 rounded p-2 space-y-2">
              <div className="text-xs text-zinc-400">Span {i + 1}</div>
              <input value={span.text} onChange={e => updateSpan(i, 'text', e.target.value)}
                className="block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-sm" />
              <div className="flex gap-2">
                <label className="flex-1 text-xs">
                  Size
                  <input type="number" value={span.size} onChange={e => updateSpan(i, 'size', +e.target.value)}
                    className="block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-sm" />
                </label>
                <label className="flex-1 text-xs">
                  Weight
                  <select value={span.weight} onChange={e => updateSpan(i, 'weight', +e.target.value)}
                    className="block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-sm">
                    <option value={400}>400</option>
                    <option value={700}>700</option>
                  </select>
                </label>
              </div>
            </div>
          ))}
          <label className="block">
            <span className="text-sm font-medium">Max Width: {maxWidth}px</span>
            <input type="range" min={100} max={800} value={maxWidth} onChange={e => setMaxWidth(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Line Height: {lineHeight}</span>
            <input type="range" min={1} max={3} step={0.1} value={lineHeight} onChange={e => setLineHeight(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showBaselines} onChange={e => setShowBaselines(e.target.checked)} />
            <span className="text-sm">Show baselines</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showBoundingBoxes} onChange={e => setShowBoundingBoxes(e.target.checked)} />
            <span className="text-sm">Show bounding boxes</span>
          </label>
        </>
      }
      preview={
        result && (
          <div className="space-y-4">
            <svg width={maxWidth + 20} height={result.height + 20} className="border border-zinc-200 dark:border-zinc-800 rounded">
              <g transform="translate(10, 10)">
                {/* Container boundary */}
                <rect x={0} y={0} width={maxWidth} height={result.height} fill="none" stroke="#e4e4e7" strokeDasharray="4" />

                {result.lines.map((line, li) => (
                  <g key={li}>
                    {/* Line bounding box */}
                    {showBoundingBoxes && (
                      <rect x={0} y={line.y} width={line.width} height={line.height}
                        fill={li % 2 === 0 ? 'rgba(59,130,246,0.05)' : 'rgba(16,185,129,0.05)'}
                        stroke={li % 2 === 0 ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)'} />
                    )}
                    {/* Baseline */}
                    {showBaselines && (
                      <line x1={0} y1={line.baseline} x2={maxWidth} y2={line.baseline}
                        stroke="rgba(239,68,68,0.4)" strokeDasharray="2" />
                    )}
                    {/* Fragments */}
                    {line.fragments.map((frag, fi) => (
                      <text key={fi} x={frag.x} y={line.baseline}
                        fontSize={frag.size} fontWeight={frag.weight} fontFamily="Inter" fill="currentColor">
                        {frag.text}
                      </text>
                    ))}
                  </g>
                ))}
              </g>
            </svg>
            <div className="text-xs font-mono text-zinc-500">
              {result.lineCount} lines, {result.width.toFixed(1)}px x {result.height.toFixed(1)}px
            </div>
          </div>
        )
      }
    />
  )
}
```

**Step 3: Verify + Commit**

```bash
git add src/app/demo/svg-typography/
git commit -m "feat: add SVG Typography demo with baseline visualization"
```

---

## Task 7: Demo — Email Template Preflight

**Files:**
- Create: `src/app/demo/email-preflight/page.tsx`
- Create: `src/app/demo/email-preflight/actions.ts`

**Step 1: Create Server Action**

Create `src/app/demo/email-preflight/actions.ts`:
```ts
'use server'

import { getMeasurer } from '@/lib/textric'

interface PreflightItem {
  label: string
  text: string
  maxWidth: number
  size: number
  weight: number
  maxLines?: number
}

export async function preflightEmail(items: PreflightItem[]) {
  const m = await getMeasurer()

  return items.map(item => {
    const result = m.measure(item.text, {
      font: 'Inter', size: item.size, weight: item.weight,
      maxWidth: item.maxWidth, lineHeight: 1.4,
      maxLines: item.maxLines,
    })

    const singleLine = m.measure(item.text, {
      font: 'Inter', size: item.size, weight: item.weight,
    })

    return {
      label: item.label,
      text: item.text,
      maxWidth: item.maxWidth,
      measuredWidth: singleLine.width,
      fits: singleLine.width <= item.maxWidth,
      lineCount: result.lineCount,
      totalLineCount: result.totalLineCount,
      truncated: result.truncated,
      lines: result.lines,
      height: result.height,
    }
  })
}
```

**Step 2: Create the page component**

Create `src/app/demo/email-preflight/page.tsx`:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { preflightEmail } from './actions'

type PreflightResult = Awaited<ReturnType<typeof preflightEmail>>

const defaultItems = [
  { label: 'Subject Line', text: 'Your Pro subscription has been renewed successfully', maxWidth: 400, size: 16, weight: 700 },
  { label: 'Preheader', text: 'Next billing date: April 30, 2026. Manage your subscription in settings.', maxWidth: 500, size: 14, weight: 400 },
  { label: 'CTA Button', text: 'View Invoice', maxWidth: 200, size: 16, weight: 700 },
  { label: 'Footer Link', text: 'Unsubscribe from marketing emails', maxWidth: 280, size: 12, weight: 400 },
]

export default function EmailPreflightPage() {
  const [items, setItems] = useState(defaultItems)
  const [results, setResults] = useState<PreflightResult | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      preflightEmail(items).then(setResults)
    }, 150)
    return () => clearTimeout(timer)
  }, [items])

  const updateItem = (i: number, field: string, value: string | number) => {
    setItems(prev => prev.map((item, j) => j === i ? { ...item, [field]: value } : item))
  }

  return (
    <DemoShell
      title="Email Template Preflight"
      description="Check if text fits in fixed-width email containers. Red = overflow, green = fits."
      controls={
        <>
          {items.map((item, i) => (
            <div key={i} className="border border-zinc-200 dark:border-zinc-800 rounded p-2 space-y-2">
              <div className="text-xs font-medium text-zinc-500">{item.label}</div>
              <input value={item.text} onChange={e => updateItem(i, 'text', e.target.value)}
                className="block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-sm" />
              <label className="text-xs">
                Container: {item.maxWidth}px
                <input type="range" min={100} max={600} value={item.maxWidth}
                  onChange={e => updateItem(i, 'maxWidth', +e.target.value)} className="block w-full" />
              </label>
            </div>
          ))}
        </>
      }
      preview={
        <div className="space-y-6 w-full max-w-xl">
          {results?.map((r, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`inline-block w-3 h-3 rounded-full ${r.fits ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium">{r.label}</span>
                <span className="text-xs text-zinc-400 ml-auto">
                  {r.measuredWidth.toFixed(0)}px / {r.maxWidth}px
                </span>
              </div>
              <div className="relative border rounded overflow-hidden" style={{ width: r.maxWidth }}>
                <div className="p-3 bg-white dark:bg-zinc-900"
                  style={{ fontSize: items[i]!.size, fontWeight: items[i]!.weight, fontFamily: 'Inter' }}>
                  {r.lines.join(' ')}
                  {r.truncated && <span className="text-red-400">...</span>}
                </div>
                {!r.fits && (
                  <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-red-100 dark:from-red-950 to-transparent" />
                )}
              </div>
              {r.truncated && (
                <div className="text-xs text-red-500">
                  Truncated: {r.lineCount}/{r.totalLineCount} lines shown
                </div>
              )}
            </div>
          ))}
        </div>
      }
    />
  )
}
```

**Step 3: Verify + Commit**

```bash
git add src/app/demo/email-preflight/
git commit -m "feat: add Email Template Preflight demo"
```

---

## Task 8: Demo — Wrap Visualizer

**Files:**
- Create: `src/app/demo/wrap-visualizer/page.tsx`
- Create: `src/app/demo/wrap-visualizer/actions.ts`

**Step 1: Create Server Action**

Create `src/app/demo/wrap-visualizer/actions.ts`:
```ts
'use server'

import { getMeasurer } from '@/lib/textric'

export async function visualizeWrap(formData: {
  text: string
  size: number
  weight: number
  maxWidth: number
  lineHeight: number
}) {
  const m = await getMeasurer()

  const result = m.measure(formData.text, {
    font: 'Inter', size: formData.size, weight: formData.weight,
    maxWidth: formData.maxWidth, lineHeight: formData.lineHeight,
  })

  // Also measure each line to get precise widths
  const lineDetails = result.lines.map((line, i) => {
    const lineMeasure = m.measure(line, { font: 'Inter', size: formData.size, weight: formData.weight })
    return {
      text: line,
      width: result.lineWidths[i]!,
      fullWidth: lineMeasure.width,
      chars: [...line],
    }
  })

  return {
    lines: lineDetails,
    lineCount: result.lineCount,
    totalLineCount: result.totalLineCount,
    truncated: result.truncated,
    height: result.height,
    maxLineWidth: result.width,
  }
}
```

**Step 2: Create the page component**

Create `src/app/demo/wrap-visualizer/page.tsx`:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { visualizeWrap } from './actions'

type WrapResult = Awaited<ReturnType<typeof visualizeWrap>>

export default function WrapVisualizerPage() {
  const [text, setText] = useState('The quick brown fox jumps over the lazy dog. 你好世界，这是一个中英文混排的测试。')
  const [size, setSize] = useState(18)
  const [weight, setWeight] = useState(400)
  const [maxWidth, setMaxWidth] = useState(350)
  const [lineHeight, setLineHeight] = useState(1.4)
  const [result, setResult] = useState<WrapResult | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      visualizeWrap({ text, size, weight, maxWidth, lineHeight }).then(setResult)
    }, 150)
    return () => clearTimeout(timer)
  }, [text, size, weight, maxWidth, lineHeight])

  return (
    <DemoShell
      title="Wrap Visualizer"
      description="Visualize line-break decisions. Each line shows its pixel width relative to maxWidth."
      controls={
        <>
          <label className="block">
            <span className="text-sm font-medium">Text</span>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={4}
              className="mt-1 block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Font Size: {size}px</span>
            <input type="range" min={10} max={48} value={size} onChange={e => setSize(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Max Width: {maxWidth}px</span>
            <input type="range" min={50} max={800} value={maxWidth} onChange={e => setMaxWidth(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Line Height: {lineHeight}</span>
            <input type="range" min={1} max={3} step={0.1} value={lineHeight} onChange={e => setLineHeight(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
        </>
      }
      preview={
        <div className="space-y-4 w-full max-w-2xl">
          {result && (
            <>
              <div className="text-sm text-zinc-500 mb-2">
                {result.lineCount} lines, {result.maxLineWidth.toFixed(1)}px max width
              </div>

              <div className="space-y-1">
                {result.lines.map((line, i) => {
                  const pct = (line.width / maxWidth) * 100
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400 w-6">{i + 1}</span>
                        <div className="flex-1 relative h-8 bg-zinc-100 dark:bg-zinc-900 rounded overflow-hidden"
                          style={{ width: maxWidth }}>
                          <div className="absolute inset-y-0 left-0 rounded"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: pct > 95 ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.1)',
                            }} />
                          <div className="absolute inset-0 flex items-center px-2 truncate"
                            style={{ fontSize: Math.min(size, 16), fontWeight: weight, fontFamily: 'Inter' }}>
                            {line.text || <span className="text-zinc-300 italic">empty</span>}
                          </div>
                        </div>
                        <span className="text-xs font-mono text-zinc-400 w-16 text-right">
                          {line.width.toFixed(0)}px
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* maxWidth ruler */}
              <div className="flex items-center gap-2 mt-4">
                <span className="text-xs text-zinc-400 w-6" />
                <div className="border-t-2 border-dashed border-zinc-300" style={{ width: maxWidth }} />
                <span className="text-xs text-zinc-400">{maxWidth}px</span>
              </div>
            </>
          )}
        </div>
      }
    />
  )
}
```

**Step 3: Verify + Commit**

```bash
git add src/app/demo/wrap-visualizer/
git commit -m "feat: add Wrap Visualizer demo"
```

---

## Task 9: Demo — Performance Benchmark

**Files:**
- Create: `src/app/demo/benchmark/page.tsx`
- Create: `src/app/demo/benchmark/actions.ts`

**Step 1: Create Server Action**

Create `src/app/demo/benchmark/actions.ts`:
```ts
'use server'

import { getMeasurer } from '@/lib/textric'

export async function runBenchmark(formData: {
  counts: number[]
  text: string
  size: number
  maxWidth: number
}) {
  const m = await getMeasurer()
  const results: Array<{ count: number; durationMs: number; opsPerSec: number }> = []

  for (const count of formData.counts) {
    const start = performance.now()
    for (let i = 0; i < count; i++) {
      m.measure(formData.text, {
        font: 'Inter', size: formData.size, maxWidth: formData.maxWidth,
      })
    }
    const durationMs = performance.now() - start

    results.push({
      count,
      durationMs: Math.round(durationMs * 100) / 100,
      opsPerSec: Math.round(count / (durationMs / 1000)),
    })
  }

  return results
}
```

**Step 2: Create the page component**

Create `src/app/demo/benchmark/page.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { runBenchmark } from './actions'

type BenchResult = Awaited<ReturnType<typeof runBenchmark>>

export default function BenchmarkPage() {
  const [text, setText] = useState('The quick brown fox jumps over the lazy dog.')
  const [size, setSize] = useState(16)
  const [maxWidth, setMaxWidth] = useState(300)
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<BenchResult | null>(null)

  const run = async () => {
    setRunning(true)
    const r = await runBenchmark({
      counts: [100, 1000, 5000, 10000, 20000],
      text, size, maxWidth,
    })
    setResults(r)
    setRunning(false)
  }

  const maxOps = results ? Math.max(...results.map(r => r.opsPerSec)) : 0

  return (
    <DemoShell
      title="Performance Benchmark"
      description="Measure text layout performance at scale. All computation runs server-side via Textric."
      controls={
        <>
          <label className="block">
            <span className="text-sm font-medium">Text</span>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
              className="mt-1 block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Font Size: {size}px</span>
            <input type="range" min={8} max={72} value={size} onChange={e => setSize(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Max Width: {maxWidth}px</span>
            <input type="range" min={50} max={800} value={maxWidth} onChange={e => setMaxWidth(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
          <button onClick={run} disabled={running}
            className="w-full py-2 rounded bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50">
            {running ? 'Running...' : 'Run Benchmark'}
          </button>
        </>
      }
      preview={
        <div className="space-y-6 w-full max-w-lg">
          {results ? (
            <>
              <div className="space-y-3">
                {results.map(r => (
                  <div key={r.count} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{r.count.toLocaleString()} items</span>
                      <span className="font-mono text-zinc-500">{r.durationMs}ms</span>
                    </div>
                    <div className="h-8 bg-zinc-100 dark:bg-zinc-900 rounded overflow-hidden relative">
                      <div className="absolute inset-y-0 left-0 bg-blue-500 rounded transition-all duration-500"
                        style={{ width: `${(r.opsPerSec / maxOps) * 100}%` }} />
                      <div className="absolute inset-0 flex items-center px-3 text-xs font-mono">
                        {r.opsPerSec.toLocaleString()} ops/sec
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-zinc-400">
                All measurements run server-side. Each operation = measure() with multi-line wrapping.
              </div>
            </>
          ) : (
            <div className="text-center text-zinc-400 py-12">
              Click "Run Benchmark" to start
            </div>
          )}
        </div>
      }
    />
  )
}
```

**Step 3: Verify + Commit**

```bash
git add src/app/demo/benchmark/
git commit -m "feat: add Performance Benchmark demo"
```

---

## Task 10: Landing Page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Replace landing page**

Replace `src/app/page.tsx`:
```tsx
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
```

**Step 2: Verify**

Open: http://localhost:3000
Expected: Landing page with hero text, GitHub/npm links, 7 demo cards in a grid (4 Showcase blue, 3 Interactive green).

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add landing page with demo cards"
```

---

## Task 11: Final verification

**Step 1: Build**

Run: `pnpm build`
Expected: Build succeeds, all pages statically analyzed.

**Step 2: Navigate all pages**

Run: `pnpm dev` and visit:
- http://localhost:3000 (landing)
- http://localhost:3000/demo/playground
- http://localhost:3000/demo/price-tag
- http://localhost:3000/demo/og-image
- http://localhost:3000/demo/svg-typography
- http://localhost:3000/demo/email-preflight
- http://localhost:3000/demo/wrap-visualizer
- http://localhost:3000/demo/benchmark

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: final verification — all 7 demos working"
```
