'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useTextric } from '@/hooks/use-textric'

const LAYER_COLORS = {
  background: '#111827',
  title: '#ffffff',
  subtitle: '#9CA3AF',
  branding: '#6B7280',
}

export default function OGImagePage() {
  const m = useTextric()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fontLoaded, setFontLoaded] = useState(false)

  const [title, setTitle] = useState('Textric: Text Layout for AI')
  const [subtitle, setSubtitle] = useState('Line wrapping, rich text, and precise metrics — pure JS, no browser.')
  const [titleSize, setTitleSize] = useState(48)
  const [subtitleSize, setSubtitleSize] = useState(24)
  const [width] = useState(1200)
  const [height] = useState(630)
  const [padding, setPadding] = useState(60)
  const [autoFit, setAutoFit] = useState(false)

  const [layers, setLayers] = useState({
    background: true,
    title: true,
    subtitle: true,
    branding: true,
  })

  // Ensure canvas font is loaded
  useEffect(() => {
    const font = new FontFace('Noto Sans SC', 'url(/fonts/NotoSansSC-Subset.ttf)')
    font.load().then(f => {
      document.fonts.add(f)
      setFontLoaded(true)
    })
  }, [])

  const result = useMemo(() => {
    if (!m) return null
    const contentWidth = width - padding * 2
    const titleResult = m.measure(title, { font: 'Noto Sans SC', size: titleSize, weight: 700, maxWidth: contentWidth, lineHeight: 1.2 })
    const subtitleResult = m.measure(subtitle, { font: 'Noto Sans SC', size: subtitleSize, weight: 400, maxWidth: contentWidth, lineHeight: 1.4 })
    const titleFit = m.fitText(title, { font: 'Noto Sans SC', maxWidth: contentWidth, maxHeight: height * 0.5, weight: 700, lineHeight: 1.2 })
    return {
      title: { lines: titleResult.lines, width: titleResult.width, height: titleResult.height, lineCount: titleResult.lineCount },
      subtitle: { lines: subtitleResult.lines, width: subtitleResult.width, height: subtitleResult.height },
      fitTitle: { size: titleFit.size, lines: titleFit.lines, height: titleFit.height },
    }
  }, [m, title, subtitle, titleSize, subtitleSize, width, height, padding])

  const drawCanvas = useCallback((canvas: HTMLCanvasElement) => {
    if (!result || !fontLoaded) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // HiDPI support
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Layer 1: Background
    if (layers.background) {
      ctx.fillStyle = LAYER_COLORS.background
      ctx.beginPath()
      ctx.roundRect(0, 0, width, height, 16)
      ctx.fill()
    } else {
      ctx.clearRect(0, 0, width, height)
      // Checkerboard for transparency
      const size = 12
      for (let y = 0; y < height; y += size) {
        for (let x = 0; x < width; x += size) {
          ctx.fillStyle = (x / size + y / size) % 2 === 0 ? '#1a1a2e' : '#16162a'
          ctx.fillRect(x, y, size, size)
        }
      }
    }

    // Layer 2: Title
    if (layers.title) {
      const useFit = autoFit
      const lines = useFit ? result.fitTitle.lines : result.title.lines
      const size = useFit ? result.fitTitle.size : titleSize
      ctx.fillStyle = LAYER_COLORS.title
      ctx.font = `bold ${size}px "Noto Sans SC"`
      ctx.textBaseline = 'top'
      lines.forEach((line, i) => {
        ctx.fillText(line, padding, padding + i * size * 1.2)
      })
    }

    // Layer 3: Subtitle
    if (layers.subtitle) {
      const titleH = autoFit ? result.fitTitle.height : result.title.height
      ctx.fillStyle = LAYER_COLORS.subtitle
      ctx.font = `${subtitleSize}px "Noto Sans SC"`
      ctx.textBaseline = 'top'
      result.subtitle.lines.forEach((line, i) => {
        ctx.fillText(line, padding, padding + titleH + 24 + i * subtitleSize * 1.4)
      })
    }

    // Layer 4: Branding
    if (layers.branding) {
      ctx.fillStyle = LAYER_COLORS.branding
      ctx.font = '18px "Noto Sans SC"'
      ctx.textBaseline = 'bottom'
      ctx.fillText('textric.dev', padding, height - padding)
    }
  }, [result, fontLoaded, width, height, padding, titleSize, subtitleSize, autoFit, layers])

  // Redraw canvas whenever inputs change
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) drawCanvas(canvas)
  }, [drawCanvas])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'og-image.png'
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const scale = 0.5

  return (
    <DemoShell
      title="OG Image Generator"
      description="Textric computes text layout, Canvas renders the image. Download as PNG — no browser layout engine needed."
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

          {/* Layers */}
          <div className="space-y-2 pt-2 border-t border-border">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Layers</Label>
            {(Object.keys(layers) as Array<keyof typeof layers>).map(key => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={layers[key]}
                  onChange={() => toggleLayer(key)}
                  className="accent-primary"
                />
                <span className="text-sm capitalize">{key}</span>
                <span
                  className="ml-auto w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: LAYER_COLORS[key] }}
                />
              </label>
            ))}
          </div>

          {/* Download */}
          <Button onClick={handleDownload} className="w-full mt-2">
            Download PNG
          </Button>
        </>
      }
      preview={
        <div className="space-y-3">
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: width * scale, height: height * scale }}>
            <canvas
              ref={canvasRef}
              style={{ width, height }}
              className="rounded-lg shadow-lg"
            />
          </div>
          {result && (
            <div className="font-mono text-xs text-muted-foreground space-y-0.5">
              <div>canvas: <span className="text-emerald-400">{width}×{height}</span></div>
              <div>title: <span className="text-emerald-400">{(autoFit ? result.fitTitle.lines : result.title.lines).length} lines</span></div>
              <div>subtitle: <span className="text-emerald-400">{result.subtitle.lines.length} lines</span></div>
            </div>
          )}
        </div>
      }
    />
  )
}
