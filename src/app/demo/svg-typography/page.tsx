'use client'

import { useState, useEffect } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { layoutRichSVG } from './actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

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
            <div key={i} className="bg-card border border-border rounded-lg p-3 space-y-2">
              <div className="text-xs text-muted-foreground">Span {i + 1}</div>
              <Input
                value={span.text}
                onChange={e => updateSpan(i, 'text', e.target.value)}
              />
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Size</Label>
                  <Input
                    type="number"
                    value={span.size}
                    onChange={e => updateSpan(i, 'size', +e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Weight</Label>
                  <Select
                    value={span.weight}
                    onValueChange={(v) => { if (v != null) updateSpan(i, 'weight', +v) }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={400}>400</SelectItem>
                      <SelectItem value={700}>700</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <Label>Max Width: {maxWidth}px</Label>
            <Slider
              value={[maxWidth]}
              onValueChange={(v) => setMaxWidth(typeof v === 'number' ? v : v[0])}
              min={100}
              max={800}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Line Height: {lineHeight}</Label>
            <Slider
              value={[lineHeight]}
              onValueChange={(v) => setLineHeight(typeof v === 'number' ? v : v[0])}
              min={1}
              max={3}
              step={0.1}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showBaselines}
              onChange={e => setShowBaselines(e.target.checked)}
              className="accent-primary"
            />
            <span className="text-sm">Show baselines</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showBoundingBoxes}
              onChange={e => setShowBoundingBoxes(e.target.checked)}
              className="accent-primary"
            />
            <span className="text-sm">Show bounding boxes</span>
          </label>
        </>
      }
      preview={
        result && (
          <div className="space-y-4">
            <svg width={maxWidth + 20} height={result.height + 20} className="border border-border rounded">
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
            <div className="font-mono text-xs text-muted-foreground">
              {result.lineCount} lines, {result.width.toFixed(1)}px x {result.height.toFixed(1)}px
            </div>
          </div>
        )
      }
    />
  )
}
