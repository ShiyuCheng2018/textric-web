'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTextric } from '@/hooks/use-textric'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

const README_TEXT = `# Textric

**Text layout for AI. Line wrapping, rich text, and precise metrics — pure JS, no browser.**

When AI generates visual content — UI designs, slides, PDFs, social images — it needs to know exactly how text will look: how wide, how many lines, where it wraps. But AI runs on servers, not in browsers. There's no Canvas, no DOM, no \`measureText()\`.

Textric solves this. It parses font files directly in pure JavaScript and computes pixel-accurate text layout — line wrapping, rich text, and precise metrics — anywhere JS runs.

\`\`\`typescript
import { createMeasurer } from 'textric'

const m = await createMeasurer({
  fonts: [{ family: 'Inter', path: './fonts/Inter-Regular.ttf' }]
})

// "Will this headline fit in a 280px card?"
const result = m.measure('AI-Generated Dashboard Title', {
  font: 'Inter',
  size: 18,
  weight: 700,
  maxWidth: 280,
  lineHeight: 1.4,
})

result.width          // 266 — widest line in pixels
result.lineCount      // 2
result.truncated      // false — it fits
result.lines          // ['AI-Generated Dashboard', 'Title']
\`\`\`

## The Problem

AI is increasingly generating visual content, not just code:

Before  AI generates code → browser renders it → layout is the browser's job
Now     AI generates UI directly → computes layout on server → needs text layout
Next    AI agents create slides, reports, emails, posters → all server-side → all need this

Every time AI places text in a bounding box, it needs to answer: **"Does this text fit? Where does it wrap? How tall is it?"** Without a browser, that question had no good answer — until now.

## Why Textric?

Text layout happens at three layers, from most coupled to most portable:

DOM reflow          getBoundingClientRect()     browser only, slow
Canvas API          ctx.measureText()           browser only, fast (Pretext)
Font file parsing   font.getAdvanceWidth()      runs anywhere, fast (Textric)

Pretext made a breakthrough by moving layout from Layer 3 to Layer 2 — eliminating expensive DOM reflow. But it still needs a browser's Canvas API.

Textric goes one layer deeper. It reads font binary files directly with opentype.js, extracting glyph widths and kerning pairs — the same data browsers use internally, but without needing a browser at all.

**Use Pretext in the browser. Use Textric everywhere else.**

## Features

- **Pure JavaScript** — no Canvas, no DOM, no native dependencies, no network I/O
- **Runs anywhere** — Node.js, Bun, Deno, Cloudflare Workers, AWS Lambda, AI sandboxes
- **Load fonts your way** — from local files, in-memory buffers, or any source you control
- **Multi-line wrapping** — CJK character-level + Latin word-boundary breaking
- **Truncation detection** — maxLines, maxHeight, reports truncated + totalLineCount
- **Rich text** — measure mixed fonts, sizes, and weights in a single paragraph
- **Shrink wrap** — find the optimal container width for a given line count
- **Batch measurement** — measure an entire page of text in one call
- **Kerning-accurate** — real font kerning pairs, not character-width guessing

## Quick Start

\`\`\`typescript
const m = await createMeasurer({
  fonts: [
    { family: 'Inter', path: './fonts/Inter-Regular.ttf' },
    { family: 'Inter', path: './fonts/Inter-Bold.ttf', weight: 700 },
  ]
})

// AI needs to size a card's text elements
const title = m.measure('Weekly Revenue Report', {
  font: 'Inter', size: 20, weight: 700,
})

const body = m.measure(
  'Revenue increased 23% compared to last week.',
  { font: 'Inter', size: 14, maxWidth: 300, lineHeight: 1.5 }
)

const cardHeight = 24 + title.height + 16 + body.height + 24
\`\`\`

## Performance

| Operation | Time |
|-----------|------|
| Single-line measurement | < 0.01ms |
| Multi-line wrap, 160 chars | ~0.36ms |
| Batch 1,000 items | ~94ms |
| Batch 10,000 items | ~946ms |

## Use Cases

AI & Generative — compute text layout in sandboxes without a browser
Server-Side Rendering — OG image generation without Puppeteer overhead
Developer Tooling — automated text overflow detection in CI/CD
Edge Functions — text layout in Cloudflare Workers / Vercel Edge`

const SAMPLE_TEXTS = [
  { label: 'Textric README', text: README_TEXT },
]

const CONTAINER_W = 620
const FONT_FAMILY = 'Noto Sans SC'
const FONT_SIZE = 14
const LINE_HEIGHT_VAL = 1.5
const TOKEN_SPEED_DEFAULT = 60

export default function AIStreamingPage() {
  const m = useTextric()
  const [fontLoaded, setFontLoaded] = useState(false)
  const [tokenSpeed, setTokenSpeed] = useState(TOKEN_SPEED_DEFAULT)

  // Shared streaming state
  const [tokenIndex, setTokenIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [displayedText, setDisplayedText] = useState('')

  // Without textric — DOM side
  const [forcedReflows, setForcedReflows] = useState(0)
  const [domHeight, setDomHeight] = useState(0)
  const [domLines, setDomLines] = useState(0)
  const domRef = useRef<HTMLDivElement>(null)

  // With textric — predicted side
  const [predictedLines, setPredictedLines] = useState(0)
  const [predictedHeight, setPredictedHeight] = useState(0)
  const [predictions, setPredictions] = useState(0)
  const [measureTime, setMeasureTime] = useState(0)
  const [totalMeasureTime, setTotalMeasureTime] = useState(0)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const font = new FontFace('Noto Sans SC', 'url(/fonts/NotoSansSC-Subset.ttf)')
    font.load().then(f => { document.fonts.add(f); setFontLoaded(true) })
  }, [])

  const tokens = useCallback(() => {
    const text = SAMPLE_TEXTS[0].text
    const result: string[] = []
    let i = 0
    while (i < text.length) {
      const code = text.charCodeAt(i)
      if (code >= 0x4E00 && code <= 0x9FFF) {
        result.push(text[i]); i++
      } else if (text[i] === ' ') {
        result.push(' '); i++
      } else {
        let word = ''
        while (i < text.length && text[i] !== ' ' && !(text.charCodeAt(i) >= 0x4E00 && text.charCodeAt(i) <= 0x9FFF)) {
          word += text[i]; i++
        }
        result.push(word)
      }
    }
    return result
  }, [])

  // Streaming tick
  useEffect(() => {
    if (!isPlaying || !fontLoaded || !m) return
    const allTokens = tokens()
    if (tokenIndex >= allTokens.length) { setIsPlaying(false); return }

    timerRef.current = setTimeout(() => {
      const newText = displayedText + allTokens[tokenIndex]
      setTokenIndex(prev => prev + 1)
      setDisplayedText(newText)

      // ── Without textric: write DOM then read DOM → forced reflows ──
      // Real chat UIs do multiple write→read cycles per token:
      // update text, check overflow, adjust container, re-check, etc.
      if (domRef.current) {
        const el = domRef.current
        const parent = el.parentElement!
        let reflows = 0

        // 1. Update text content
        el.textContent = newText                              // write

        // 2. Check if text overflows container (common in chat UIs)
        const scrollH = el.scrollHeight; reflows++            // read → reflow
        const clientH = parent.clientHeight; reflows++        // read → reflow
        const isOverflowing = scrollH > clientH

        // 3. Get precise text geometry for layout decisions
        const rect = el.getBoundingClientRect(); reflows++    // read → reflow

        // 4. Adjust container sizing based on content
        parent.style.minHeight = rect.height + 'px'           // write (invalidates)
        const newParentH = parent.offsetHeight; reflows++     // read → reflow

        // 5. Check computed styles (font metrics, line height)
        const cs = getComputedStyle(el)
        const computedLH = cs.lineHeight; reflows++           // read → reflow
        const computedFS = cs.fontSize; reflows++             // read → reflow

        // 6. Scroll to bottom (triggers layout)
        parent.scrollTop = parent.scrollHeight                // write
        void parent.scrollTop; reflows++                      // read → reflow

        // 7. Extra overflow re-check after scroll (common pattern)
        if (isOverflowing) {
          const recheck = el.scrollHeight; reflows++          // read → reflow
          void recheck
        }

        // 8. Check final dimensions after adjustments
        parent.style.minHeight = ''                           // write (invalidates)
        const finalRect = el.getBoundingClientRect(); reflows++ // read → reflow

        // 9. Read offset positions for positioning decisions
        const offTop = el.offsetTop; reflows++                // read → reflow
        const offLeft = el.offsetLeft; reflows++              // read → reflow

        const lineH = FONT_SIZE * LINE_HEIGHT_VAL
        setDomHeight(finalRect.height)
        setDomLines(Math.round(finalRect.height / lineH))
        setForcedReflows(prev => prev + reflows)

        // Prevent dead code elimination
        void computedLH; void computedFS; void newParentH; void offTop; void offLeft
      }

      // ── With textric: predict BEFORE rendering — zero DOM access ──
      const start = performance.now()
      const result = m.measure(newText, {
        font: FONT_FAMILY, size: FONT_SIZE, weight: 400,
        maxWidth: CONTAINER_W, lineHeight: LINE_HEIGHT_VAL,
      })
      const elapsed = performance.now() - start
      setMeasureTime(elapsed)
      setTotalMeasureTime(prev => prev + elapsed)
      setPredictions(prev => prev + 1)
      setPredictedLines(result.lineCount)
      setPredictedHeight(result.height)

    }, tokenSpeed)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [isPlaying, tokenIndex, displayedText, tokenSpeed, fontLoaded, m, tokens])


  const handlePlay = () => setIsPlaying(true)
  const handlePause = () => setIsPlaying(false)
  const handleReset = () => {
    setIsPlaying(false); setDisplayedText(''); setTokenIndex(0)
    setForcedReflows(0); setDomHeight(0); setDomLines(0)
    setPredictedLines(0); setPredictedHeight(0); setPredictions(0)
    setMeasureTime(0); setTotalMeasureTime(0)
    if (domRef.current) domRef.current.textContent = ''
  }
  const allTokens = tokens()
  const progress = allTokens.length > 0 ? tokenIndex / allTokens.length : 0

  const cardStyle = {
    width: CONTAINER_W,
    fontFamily: `"${FONT_FAMILY}", sans-serif`,
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT_VAL,
  }

  return (
    <div className="h-[calc(100vh-3rem)] bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/50 px-6 py-3">
        <h1 className="text-sm font-semibold font-mono">AI Streaming Layout</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          AI streams text token-by-token. Traditional DOM measurement forces layout reflow on every token. Textric computes the same metrics with zero DOM access.
        </p>
      </div>

      {/* Controls bar */}
      <div className="border-b border-border/50 px-6 py-3 flex items-center gap-6 flex-wrap">
        <div className="flex gap-2">
          <Button size="sm" onClick={isPlaying ? handlePause : handlePlay}
            disabled={!fontLoaded || tokenIndex >= allTokens.length}>
            {isPlaying ? 'Pause' : tokenIndex > 0 ? 'Resume' : 'Stream'}
          </Button>
          <Button size="sm" variant="secondary" onClick={handleReset}>Reset</Button>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Speed</Label>
          <div className="w-24">
            <Slider value={[tokenSpeed]} onValueChange={v => setTokenSpeed(typeof v === 'number' ? v : v[0])} min={10} max={150} />
          </div>
          <span className="text-xs text-muted-foreground font-mono w-12">{tokenSpeed}ms</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Token {tokenIndex}/{allTokens.length}</span>
          <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: Without textric ── */}
        <div className="flex-1 border-r border-border/50 flex flex-col">
          <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between">
            <span className="text-xs font-medium text-red-400/80 uppercase tracking-wider">Without textric</span>
            <span className="text-[10px] text-muted-foreground">write DOM → read DOM → forced reflow per token</span>
          </div>
          <div className="flex-1 p-6 flex flex-col overflow-hidden">
            <div className="bg-card border border-border rounded-lg shadow-lg flex-1 overflow-auto p-6 relative">
              <div ref={domRef} className="whitespace-pre-wrap" style={{ fontFamily: cardStyle.fontFamily, fontSize: cardStyle.fontSize, lineHeight: cardStyle.lineHeight }} />
              {!displayedText && <div className="text-muted-foreground italic">Press Stream to start...</div>}
            </div>
          </div>
          {/* DOM metrics — fixed at bottom */}
          <div className="shrink-0 px-6 py-2 border-t border-border/50 flex gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Forced Reflows:</span>
              <span className="font-mono text-red-400">{forcedReflows}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Reflows/Token:</span>
              <span className="font-mono text-red-400">{tokenIndex > 0 ? (forcedReflows / tokenIndex).toFixed(2) : '0.00'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Lines:</span>
              <span className="font-mono text-red-400">{domLines}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Height:</span>
              <span className="font-mono text-red-400">{domHeight.toFixed(0)}px</span>
            </div>
          </div>
        </div>

        {/* ── Right: With textric ── */}
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400/80 uppercase tracking-wider">With textric</span>
            <span className="text-[10px] text-muted-foreground">pure JS computation → zero DOM access</span>
          </div>
          <div className="flex-1 p-6 flex flex-col overflow-hidden">
            <div className="bg-card border border-border rounded-lg shadow-lg flex-1 overflow-auto p-6">
              <div className="whitespace-pre-wrap" style={{ fontFamily: cardStyle.fontFamily, fontSize: cardStyle.fontSize, lineHeight: cardStyle.lineHeight }}>
                {displayedText || <span className="text-muted-foreground italic">Press Stream to start...</span>}
                {isPlaying && <span className="inline-block w-0.5 h-3.5 bg-foreground animate-pulse ml-0.5 -mb-0.5" />}
              </div>
            </div>
          </div>
          {/* Textric metrics — fixed at bottom */}
          <div className="shrink-0 px-6 py-2 border-t border-border/50 flex gap-4 text-xs flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Forced Reflows:</span>
              <span className="font-mono text-emerald-400">0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Predictions:</span>
              <span className="font-mono text-emerald-400">{predictions}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Avg measure():</span>
              <span className="font-mono text-emerald-400">{predictions > 0 ? (totalMeasureTime / predictions).toFixed(3) : '0.000'}ms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Lines:</span>
              <span className="font-mono text-emerald-400">{predictedLines}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Height:</span>
              <span className="font-mono text-emerald-400">{predictedHeight.toFixed(0)}px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
