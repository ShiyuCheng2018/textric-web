'use client'

import { useState } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { runBenchmark } from './actions'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

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
          <div className="space-y-2">
            <Label>Text</Label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={3}
              className="w-full bg-input/30 border border-border text-sm rounded-lg font-mono resize-none p-3 focus:ring-1 focus:ring-ring focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Font Size: {size}px</Label>
            <Slider
              value={[size]}
              onValueChange={(v) => setSize(typeof v === 'number' ? v : v[0])}
              min={8}
              max={72}
            />
          </div>
          <div className="space-y-2">
            <Label>Max Width: {maxWidth}px</Label>
            <Slider
              value={[maxWidth]}
              onValueChange={(v) => setMaxWidth(typeof v === 'number' ? v : v[0])}
              min={50}
              max={800}
            />
          </div>
          <Button onClick={run} disabled={running} className="w-full">
            {running ? 'Running...' : 'Run Benchmark'}
          </Button>
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
                      <span className="font-mono text-muted-foreground">{r.durationMs}ms</span>
                    </div>
                    <div className="h-8 bg-card rounded overflow-hidden relative">
                      <div
                        className="absolute inset-y-0 left-0 bg-emerald-500 rounded transition-all duration-500"
                        style={{ width: `${(r.opsPerSec / maxOps) * 100}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3 font-mono text-xs">
                        {r.opsPerSec.toLocaleString()} ops/sec
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                All measurements run server-side. Each operation = measure() with multi-line wrapping.
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              Click &quot;Run Benchmark&quot; to start
            </div>
          )}
        </div>
      }
    />
  )
}
