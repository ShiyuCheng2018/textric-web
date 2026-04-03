'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useTextric } from '@/hooks/use-textric'

interface Span {
  text: string
  size: number
  weight: number
}

const presets: Record<string, Span[]> = {
  'Dashboard Header': [
    { text: 'Dashboard ', size: 32, weight: 700 },
    { text: 'v2.1 ', size: 12, weight: 400 },
    { text: '— Production metrics for your AI pipeline with real-time monitoring and alerts.', size: 16, weight: 400 },
  ],
  'Price Tag': [
    { text: '$', size: 16, weight: 400 },
    { text: '49', size: 48, weight: 700 },
    { text: '.99', size: 16, weight: 400 },
    { text: '/mo ', size: 14, weight: 400 },
    { text: 'billed annually', size: 12, weight: 400 },
  ],
  'Notification': [
    { text: 'Your plan ', size: 15, weight: 400 },
    { text: 'Pro', size: 15, weight: 700 },
    { text: ' renews on ', size: 15, weight: 400 },
    { text: 'April 30', size: 15, weight: 700 },
    { text: '. Revenue increased ', size: 15, weight: 400 },
    { text: '23%', size: 20, weight: 700 },
    { text: ' compared to last week.', size: 15, weight: 400 },
  ],
  'Hero Title': [
    { text: 'Text Layout ', size: 40, weight: 700 },
    { text: 'for ', size: 28, weight: 400 },
    { text: 'AI', size: 40, weight: 700 },
    { text: '. Pure JS, no browser. Runs on Node, Bun, Deno, Cloudflare Workers, AWS Lambda.', size: 16, weight: 400 },
  ],
}

const CANVAS_PADDING = 20

export default function RichTextPage() {
  const m = useTextric()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fontLoaded, setFontLoaded] = useState(false)
  const [activePreset, setActivePreset] = useState('Dashboard Header')
  const [spans, setSpans] = useState<Span[]>(presets['Dashboard Header'])
  const [maxWidth, setMaxWidth] = useState(460)
  const [lineHeight, setLineHeight] = useState(1.5)
  const [showBaselines, setShowBaselines] = useState(true)
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true)

  useEffect(() => {
    const font = new FontFace('Noto Sans SC', 'url(/fonts/NotoSansSC-Subset.ttf)')
    font.load().then(f => {
      document.fonts.add(f)
      setFontLoaded(true)
    })
  }, [])

  const result = useMemo(() => {
    if (!m) return null
    const richSpans = spans.map(s => ({ text: s.text, font: 'Noto Sans SC', size: s.size, weight: s.weight }))
    const r = m.measureRichText(richSpans, { maxWidth, lineHeight })
    return {
      width: r.width,
      height: r.height,
      lineCount: r.lineCount,
      lines: r.lines.map(line => ({
        y: line.y,
        baseline: line.baseline,
        ascent: line.ascent,
        descent: line.descent,
        height: line.height,
        width: line.width,
        fragments: line.fragments.map(f => ({
          text: f.text, x: f.x, width: f.width, size: f.size, weight: f.weight,
        })),
      })),
    }
  }, [m, spans, maxWidth, lineHeight])

  const canvasW = maxWidth + CANVAS_PADDING * 2
  const canvasH = result ? result.height + CANVAS_PADDING * 2 + 20 : 200

  const drawCanvas = useCallback((canvas: HTMLCanvasElement) => {
    if (!result || !fontLoaded) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = canvasW * dpr
    canvas.height = canvasH * dpr
    ctx.scale(dpr, dpr)

    // Background
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, canvasW, canvasH)

    const ox = CANVAS_PADDING
    const oy = CANVAS_PADDING

    // Container boundary
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.strokeRect(ox, oy, maxWidth, result.height)
    ctx.setLineDash([])

    for (let li = 0; li < result.lines.length; li++) {
      const line = result.lines[li]

      // Line bounding box
      if (showBoundingBoxes) {
        const color = li % 2 === 0 ? 'rgba(59,130,246,0.08)' : 'rgba(16,185,129,0.08)'
        const border = li % 2 === 0 ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)'
        ctx.fillStyle = color
        ctx.fillRect(ox, oy + line.y, line.width, line.height)
        ctx.strokeStyle = border
        ctx.lineWidth = 1
        ctx.strokeRect(ox + 0.5, oy + line.y + 0.5, line.width - 1, line.height - 1)
      }

      // Baseline
      if (showBaselines) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)'
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.moveTo(ox, oy + line.baseline)
        ctx.lineTo(ox + maxWidth, oy + line.baseline)
        ctx.stroke()
        ctx.setLineDash([])

        // Baseline label
        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)'
        ctx.font = '9px "Noto Sans SC"'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'bottom'
        ctx.fillText(`baseline`, ox + maxWidth + 6, oy + line.baseline + 1)
      }

      // Fragments
      for (const frag of line.fragments) {
        ctx.fillStyle = '#e4e4e7'
        ctx.font = `${frag.weight} ${frag.size}px "Noto Sans SC"`
        ctx.textAlign = 'left'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText(frag.text, ox + frag.x, oy + line.baseline)

        // Fragment underline showing individual width
        if (showBoundingBoxes) {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.3)'
          ctx.fillRect(ox + frag.x, oy + line.baseline + 2, frag.width, 2)
        }
      }
    }
  }, [result, fontLoaded, canvasW, canvasH, maxWidth, showBaselines, showBoundingBoxes])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) drawCanvas(canvas)
  }, [drawCanvas])

  const updateSpan = (i: number, field: string, value: string | number) => {
    setSpans(prev => prev.map((s, j) => j === i ? { ...s, [field]: value } : s))
  }

  return (
    <DemoShell
      title="Rich Text"
      description="Mixed font sizes sharing a baseline. Textric aligns fragments precisely — visualize the layout math."
      controls={
        <>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Presets</Label>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(presets).map(name => (
                <button key={name} onClick={() => { setActivePreset(name); setSpans(presets[name]) }}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${activePreset === name ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'}`}>
                  {name}
                </button>
              ))}
            </div>
          </div>

          {spans.map((span, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Span {i + 1}</span>
                <span className="font-mono text-xs text-muted-foreground">{span.size}px {span.weight === 700 ? 'bold' : ''}</span>
              </div>
              <Input value={span.text} onChange={e => updateSpan(i, 'text', e.target.value)} />
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Size</Label>
                  <Slider value={[span.size]} onValueChange={v => updateSpan(i, 'size', typeof v === 'number' ? v : v[0])} min={8} max={64} />
                </div>
                <div className="shrink-0">
                  <Label className="text-xs">Bold</Label>
                  <Button size="sm" variant={span.weight === 700 ? 'default' : 'secondary'}
                    onClick={() => updateSpan(i, 'weight', span.weight === 700 ? 400 : 700)} className="w-full mt-1">
                    B
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <Label>Max Width: {maxWidth}px</Label>
            <Slider value={[maxWidth]} onValueChange={v => setMaxWidth(typeof v === 'number' ? v : v[0])} min={100} max={600} />
          </div>
          <div className="space-y-2">
            <Label>Line Height: {lineHeight}</Label>
            <Slider value={[lineHeight]} onValueChange={v => setLineHeight(typeof v === 'number' ? v : v[0])} min={1} max={3} step={0.1} />
          </div>

          <div className="border-t border-border pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="baselines">Baselines</Label>
              <Switch id="baselines" checked={showBaselines} onCheckedChange={setShowBaselines} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="boxes">Bounding Boxes</Label>
              <Switch id="boxes" checked={showBoundingBoxes} onCheckedChange={setShowBoundingBoxes} />
            </div>
          </div>
        </>
      }
      preview={
        <div className="space-y-3">
          <div className="rounded-lg overflow-hidden shadow-2xl border border-border/30 inline-block">
            <canvas
              ref={canvasRef}
              style={{ width: canvasW, height: canvasH, display: 'block' }}
            />
          </div>
          {result && (
            <div className="font-mono text-xs text-muted-foreground space-y-0.5">
              <div>lines: <span className="text-emerald-400">{result.lineCount}</span></div>
              <div>size: <span className="text-emerald-400">{result.width.toFixed(0)}×{result.height.toFixed(0)}px</span></div>
            </div>
          )}
        </div>
      }
    />
  )
}
