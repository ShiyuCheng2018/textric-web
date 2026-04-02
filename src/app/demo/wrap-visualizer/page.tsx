'use client'

import { useState, useEffect } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
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
          <div className="space-y-2">
            <Label>Text</Label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={4}
              className="w-full bg-input/30 border border-border text-sm rounded-lg font-mono resize-none p-3 focus:ring-1 focus:ring-ring focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Font Size: {size}px</Label>
            <Slider
              value={[size]}
              onValueChange={(v) => setSize(typeof v === 'number' ? v : v[0])}
              min={10}
              max={48}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label>Max Width: {maxWidth}px</Label>
            <Slider
              value={[maxWidth]}
              onValueChange={(v) => setMaxWidth(typeof v === 'number' ? v : v[0])}
              min={50}
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
        </>
      }
      preview={
        <div className="space-y-4 w-full max-w-2xl">
          {result && (
            <>
              <div className="font-mono text-xs text-muted-foreground mb-2">
                {result.lineCount} lines, {result.maxLineWidth.toFixed(1)}px max width
              </div>

              <div className="space-y-1">
                {result.lines.map((line, i) => {
                  const pct = (line.width / maxWidth) * 100
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground w-6">{i + 1}</span>
                        <div
                          className="flex-1 relative h-8 bg-card rounded overflow-hidden"
                          style={{ width: maxWidth }}
                        >
                          <div
                            className="absolute inset-y-0 left-0 rounded"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: pct > 95 ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.1)',
                            }}
                          />
                          <div
                            className="absolute inset-0 flex items-center px-2 truncate"
                            style={{ fontSize: Math.min(size, 16), fontWeight: weight, fontFamily: 'Inter' }}
                          >
                            {line.text || <span className="text-muted-foreground italic">empty</span>}
                          </div>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground w-16 text-right">
                          {line.width.toFixed(0)}px
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* maxWidth ruler */}
              <div className="flex items-center gap-2 mt-4">
                <span className="font-mono text-xs text-muted-foreground w-6" />
                <div className="border-t-2 border-dashed border-border" style={{ width: maxWidth }} />
                <span className="font-mono text-xs text-muted-foreground">{maxWidth}px</span>
              </div>
            </>
          )}
        </div>
      }
    />
  )
}
