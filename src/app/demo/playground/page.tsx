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
