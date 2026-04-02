'use client'

import { useState, useMemo } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useTextric } from '@/hooks/use-textric'

type MeasureResult =
  | { mode: 'multi'; width: number; height: number; lines: string[]; lineWidths: number[]; lineCount: number; truncated: boolean }
  | { mode: 'single'; width: number; height: number; ascent: number; descent: number }

export default function PlaygroundPage() {
  const [text, setText] = useState('Hello World, this is Textric!')
  const [size, setSize] = useState(16)
  const [weight, setWeight] = useState(400)
  const [maxWidth, setMaxWidth] = useState<number | null>(300)
  const [lineHeight, setLineHeight] = useState(1.2)
  const m = useTextric()

  const result = useMemo<MeasureResult | null>(() => {
    if (!m) return null
    if (maxWidth) {
      const r = m.measure(text, { font: 'Inter', size, weight, maxWidth, lineHeight })
      return { mode: 'multi' as const, width: r.width, height: r.height, lines: r.lines, lineWidths: r.lineWidths, lineCount: r.lineCount, truncated: r.truncated }
    }
    const r = m.measure(text, { font: 'Inter', size, weight, lineHeight })
    return { mode: 'single' as const, width: r.width, height: r.height, ascent: r.ascent, descent: r.descent }
  }, [m, text, size, weight, maxWidth, lineHeight])

  return (
    <DemoShell
      title="Text Measurement Playground"
      description="Input text, adjust parameters, see measurement results in real-time."
      controls={
        <>
          {/* Text input */}
          <div className="space-y-2">
            <Label>Text</Label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={3}
              className="block w-full bg-input/30 border border-border px-3 py-2 text-sm rounded-lg font-mono resize-none focus:ring-1 focus:ring-ring focus:outline-none"
            />
          </div>

          {/* Font Size slider */}
          <div className="space-y-3">
            <Label>
              <span>Font Size</span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">{size}px</span>
            </Label>
            <Slider
              value={[size]}
              onValueChange={(v) => setSize(typeof v === 'number' ? v : v[0])}
              min={8}
              max={72}
              step={1}
            />
          </div>

          {/* Weight select */}
          <div className="space-y-2">
            <Label>Weight</Label>
            <Select value={weight} onValueChange={(v) => { if (v !== null) setWeight(v) }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={400}>Regular (400)</SelectItem>
                <SelectItem value={700}>Bold (700)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Width slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                <span>Max Width</span>
                <span className="ml-auto font-mono text-xs text-muted-foreground">
                  {maxWidth ?? 'none'}
                </span>
              </Label>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setMaxWidth(maxWidth ? null : 300)}
              >
                {maxWidth ? 'Disable' : 'Enable'}
              </Button>
            </div>
            <Slider
              value={[maxWidth ?? 800]}
              onValueChange={(v) => setMaxWidth(typeof v === 'number' ? v : v[0])}
              min={50}
              max={800}
              step={1}
              disabled={maxWidth === null}
            />
          </div>

          {/* Line Height slider */}
          <div className="space-y-3">
            <Label>
              <span>Line Height</span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">{lineHeight}</span>
            </Label>
            <Slider
              value={[lineHeight]}
              onValueChange={(v) => setLineHeight(typeof v === 'number' ? v : v[0])}
              min={0.8}
              max={3}
              step={0.1}
            />
          </div>
        </>
      }
      preview={
        <div className="space-y-4 w-full max-w-2xl">
          {result && (
            <>
              {/* Metric display */}
              <div className="font-mono text-xs bg-card rounded-lg border border-border p-4 space-y-1">
                <div className="text-muted-foreground">
                  width: <span className="text-emerald-400">{result.width.toFixed(2)}px</span>
                </div>
                <div className="text-muted-foreground">
                  height: <span className="text-emerald-400">{result.height.toFixed(2)}px</span>
                </div>
                {result.mode === 'multi' && (
                  <>
                    <div className="text-muted-foreground">
                      lineCount: <span className="text-emerald-400">{result.lineCount}</span>
                    </div>
                    <div className="text-muted-foreground">
                      truncated: <span className="text-emerald-400">{String(result.truncated)}</span>
                    </div>
                  </>
                )}
                {result.mode === 'single' && (
                  <>
                    <div className="text-muted-foreground">
                      ascent: <span className="text-emerald-400">{result.ascent.toFixed(2)}px</span>
                    </div>
                    <div className="text-muted-foreground">
                      descent: <span className="text-emerald-400">{result.descent.toFixed(2)}px</span>
                    </div>
                  </>
                )}
              </div>

              {/* Visual preview */}
              <div className="relative border border-dashed border-border inline-block">
                {maxWidth && (
                  <div className="absolute top-0 right-0 text-xs text-muted-foreground px-1">
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
