'use client'

import { useState, useEffect } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { layoutOGImage } from './actions'

type OGResult = Awaited<ReturnType<typeof layoutOGImage>>

export default function OGImagePage() {
  const [title, setTitle] = useState('Textric: Text Layout for AI')
  const [subtitle, setSubtitle] = useState('Line wrapping, rich text, and precise metrics — pure JS, no browser.')
  const [titleSize, setTitleSize] = useState(48)
  const [subtitleSize, setSubtitleSize] = useState(24)
  const [width] = useState(1200)
  const [height] = useState(630)
  const [padding, setPadding] = useState(60)
  const [result, setResult] = useState<OGResult | null>(null)
  const [autoFit, setAutoFit] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      layoutOGImage({ title, subtitle, titleSize, subtitleSize, width, height, padding }).then(setResult)
    }, 150)
    return () => clearTimeout(timer)
  }, [title, subtitle, titleSize, subtitleSize, width, height, padding])

  const scale = 0.5

  return (
    <DemoShell
      title="OG Image Generator"
      description="Preview social card layout with fitText auto-scaling. Textric computes exact line breaks server-side."
      controls={
        <>
          <label className="block">
            <span className="text-sm font-medium">Title</span>
            <textarea value={title} onChange={e => setTitle(e.target.value)} rows={2}
              className="mt-1 block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Subtitle</span>
            <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} rows={2}
              className="mt-1 block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={autoFit} onChange={e => setAutoFit(e.target.checked)} />
            <span className="text-sm font-medium">Auto-fit title size</span>
          </label>
          {!autoFit && (
            <label className="block">
              <span className="text-sm font-medium">Title Size: {titleSize}px</span>
              <input type="range" min={20} max={80} value={titleSize} onChange={e => setTitleSize(+e.target.value)}
                className="mt-1 block w-full" />
            </label>
          )}
          {autoFit && result && (
            <div className="text-sm text-zinc-500">
              fitText chose: <span className="font-mono text-blue-600">{result.fitTitle.size}px</span>
            </div>
          )}
          <label className="block">
            <span className="text-sm font-medium">Subtitle Size: {subtitleSize}px</span>
            <input type="range" min={12} max={40} value={subtitleSize} onChange={e => setSubtitleSize(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Padding: {padding}px</span>
            <input type="range" min={20} max={120} value={padding} onChange={e => setPadding(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
        </>
      }
      preview={
        result && (
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <svg width={width} height={height} className="rounded-lg shadow-lg">
              <rect width={width} height={height} fill="#111827" rx={16} />
              {/* Title */}
              {(autoFit ? result.fitTitle.lines : result.title.lines).map((line, i) => (
                <text key={`t-${i}`}
                  x={padding} y={padding + (i + 1) * (autoFit ? result.fitTitle.size : titleSize) * 1.2 - (autoFit ? result.fitTitle.size : titleSize) * 0.2}
                  fontSize={autoFit ? result.fitTitle.size : titleSize}
                  fontWeight={700} fontFamily="Inter" fill="white">
                  {line}
                </text>
              ))}
              {/* Subtitle */}
              {result.subtitle.lines.map((line, i) => {
                const titleH = autoFit ? result.fitTitle.height : result.title.height
                return (
                  <text key={`s-${i}`}
                    x={padding} y={padding + titleH + 20 + (i + 1) * subtitleSize * 1.4 - subtitleSize * 0.2}
                    fontSize={subtitleSize}
                    fontWeight={400} fontFamily="Inter" fill="#9CA3AF">
                    {line}
                  </text>
                )
              })}
              {/* Branding */}
              <text x={padding} y={height - padding} fontSize={18} fontFamily="Inter" fill="#6B7280">
                textric.dev
              </text>
            </svg>
          </div>
        )
      }
    />
  )
}
