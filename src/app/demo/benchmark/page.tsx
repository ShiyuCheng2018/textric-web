'use client'

import { useState } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { useTextric } from '@/hooks/use-textric'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const COUNTS = [100, 1000, 5000, 10000, 20000]

export default function BenchmarkPage() {
  const m = useTextric()
  const [text, setText] = useState('AI generates UI directly, computes layout on server, needs text layout.')
  const [size, setSize] = useState(16)
  const [maxWidth, setMaxWidth] = useState(300)
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<Array<{ count: number; durationMs: number; opsPerSec: number }> | null>(null)
  const [progress, setProgress] = useState(0)

  const run = async () => {
    if (!m) return
    setRunning(true)
    setResults(null)
    setProgress(0)

    const newResults: Array<{ count: number; durationMs: number; opsPerSec: number }> = []

    // Warmup — let JIT optimize before measuring
    for (let i = 0; i < 200; i++) {
      m.measure(text, { font: 'Noto Sans SC', size, maxWidth })
    }

    for (let ci = 0; ci < COUNTS.length; ci++) {
      const count = COUNTS[ci]
      // Yield to UI between each count
      await new Promise(r => setTimeout(r, 0))
      setProgress(ci + 1)

      const start = performance.now()
      for (let i = 0; i < count; i++) {
        m.measure(text, { font: 'Noto Sans SC', size, maxWidth })
      }
      const durationMs = performance.now() - start

      newResults.push({
        count,
        durationMs: Math.round(durationMs * 100) / 100,
        opsPerSec: Math.round(count / (durationMs / 1000)),
      })
    }

    setResults(newResults)
    setRunning(false)
  }

  const maxOps = results ? Math.max(...results.map(r => r.opsPerSec)) : 0

  return (
    <DemoShell
      title="Benchmark"
      description="How fast is textric? Run 100–20K measurements and see real throughput."
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
              max={500}
            />
          </div>
          <Button onClick={run} disabled={running || !m} className="w-full">
            {running ? `Running... (${progress}/${COUNTS.length})` : 'Run Benchmark'}
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
                      <span className="font-medium">{r.count.toLocaleString()} calls</span>
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
                Includes 200-call JIT warmup. Each call = measure() with multi-line wrapping. Runs in-browser, not on server.
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              {m ? 'Click "Run Benchmark" to start' : 'Loading textric...'}
            </div>
          )}
        </div>
      }
    />
  )
}
