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
