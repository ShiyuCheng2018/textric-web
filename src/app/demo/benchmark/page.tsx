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
