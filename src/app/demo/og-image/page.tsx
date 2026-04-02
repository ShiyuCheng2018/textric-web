'use client'

import { useState, useEffect } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
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
          <div className="space-y-1.5">
            <Label htmlFor="og-title">Title</Label>
            <textarea
              id="og-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              rows={2}
              className="block w-full bg-input/30 border border-border text-sm rounded-lg font-mono resize-none focus:ring-1 focus:ring-ring px-3 py-2"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="og-subtitle">Subtitle</Label>
            <textarea
              id="og-subtitle"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              rows={2}
              className="block w-full bg-input/30 border border-border text-sm rounded-lg font-mono resize-none focus:ring-1 focus:ring-ring px-3 py-2"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoFit}
              onChange={e => setAutoFit(e.target.checked)}
              className="accent-primary"
            />
            <span className="text-sm">Auto-fit title size</span>
          </label>
          {!autoFit && (
            <div className="space-y-2">
              <Label>Title Size: {titleSize}px</Label>
              <Slider
                value={[titleSize]}
                onValueChange={(v) => setTitleSize(typeof v === 'number' ? v : v[0])}
                min={20}
                max={80}
              />
            </div>
          )}
          {autoFit && result && (
            <div className="font-mono text-xs text-muted-foreground">
              fitText chose: <span className="text-emerald-400">{result.fitTitle.size}px</span>
            </div>
          )}
          <div className="space-y-2">
            <Label>Subtitle Size: {subtitleSize}px</Label>
            <Slider
              value={[subtitleSize]}
              onValueChange={(v) => setSubtitleSize(typeof v === 'number' ? v : v[0])}
              min={12}
              max={40}
            />
          </div>
          <div className="space-y-2">
            <Label>Padding: {padding}px</Label>
            <Slider
              value={[padding]}
              onValueChange={(v) => setPadding(typeof v === 'number' ? v : v[0])}
              min={20}
              max={120}
            />
          </div>
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
