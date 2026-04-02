'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useTextric } from '@/hooks/use-textric'

interface Message {
  text: string
  isMe: boolean
  time: string
}

const defaultMessages: Message[] = [
  { text: 'Hey! Have you tried Textric?', isMe: false, time: '09:41' },
  { text: 'Not yet, what is it?', isMe: true, time: '09:42' },
  { text: 'A pure JS text layout engine — line wrapping, rich text, precise metrics. No browser needed.', isMe: false, time: '09:42' },
  { text: '等等，它支持中文吗？', isMe: true, time: '09:43' },
  { text: '当然！任何语言都可以，只要字体支持就行 😄', isMe: false, time: '09:43' },
  { text: 'Nice, I\'ll check it out!', isMe: true, time: '09:44' },
]

// Layout constants
const BUBBLE_PX = 12
const BUBBLE_PY = 8
const BUBBLE_RADIUS = 16
const MSG_GAP = 4
const GROUP_GAP = 16
const SIDE_MARGIN = 14
const AVATAR_SIZE = 32
const AVATAR_GAP = 8
const TIME_FONT_SIZE = 10
const TIME_HEIGHT = 16
const HEADER_HEIGHT = 56
const ME_COLOR = '#007AFF'
const OTHER_COLOR = '#1C1C1E'
const TEXT_COLOR_ME = '#FFFFFF'
const TEXT_COLOR_OTHER = '#E5E5EA'
const TIME_COLOR = '#8E8E93'
const HEADER_BG = '#1C1C1E'

// Metrics overlay colors (alpha multiplied by transition opacity)
const mc = (r: number, g: number, b: number, a: number, t: number) => `rgba(${r},${g},${b},${a * t})`
const METRIC_FONT_SIZE = 9

export default function ChatBubblePage() {
  const m = useTextric()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fontLoaded, setFontLoaded] = useState(false)
  const [messages, setMessages] = useState<Message[]>(defaultMessages)
  const [newMsg, setNewMsg] = useState('')
  const [fontSize, setFontSize] = useState(15)
  const [canvasWidth] = useState(390)
  const maxAllowedBubble = 300
  const [maxBubbleWidth, setMaxBubbleWidth] = useState(260)
  const [showMetrics, setShowMetrics] = useState(false)
  const metricsOpacity = useRef(0)
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    const font = new FontFace('Noto Sans SC', 'url(/fonts/NotoSansSC-Subset.ttf)')
    font.load().then(f => {
      document.fonts.add(f)
      setFontLoaded(true)
    })
  }, [])

  const layout = useMemo(() => {
    if (!m) return null
    const maxTextWidth = maxBubbleWidth - BUBBLE_PX * 2
    return messages.map((msg, i) => {
      const measured = m.measure(msg.text, {
        font: 'Noto Sans SC', size: fontSize, weight: 400,
        maxWidth: maxTextWidth, lineHeight: 1.4,
      })
      const bubbleW = Math.min(measured.width, maxTextWidth) + BUBBLE_PX * 2
      const bubbleH = measured.height + BUBBLE_PY * 2
      const prevMsg = i > 0 ? messages[i - 1] : null
      const sameGroup = prevMsg && prevMsg.isMe === msg.isMe
      return {
        ...msg,
        lines: measured.lines,
        lineWidths: measured.lineWidths,
        bubbleW,
        bubbleH,
        textW: measured.width,
        textH: measured.height,
        sameGroup,
        lineCount: measured.lineCount,
        maxTextWidth,
      }
    })
  }, [m, messages, fontSize, maxBubbleWidth])

  const totalHeight = useMemo(() => {
    if (!layout) return 500
    const extraPerMsg = showMetrics ? 12 : 0
    let h = HEADER_HEIGHT + 16
    for (const b of layout) {
      h += b.sameGroup ? MSG_GAP : GROUP_GAP
      h += b.bubbleH
      h += TIME_HEIGHT + extraPerMsg
    }
    return h + 20
  }, [layout, showMetrics])

  const drawCanvas = useCallback((canvas: HTMLCanvasElement) => {
    if (!layout || !fontLoaded) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = canvasWidth * dpr
    canvas.height = totalHeight * dpr
    ctx.scale(dpr, dpr)

    // Background
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvasWidth, totalHeight)

    // Header
    ctx.fillStyle = HEADER_BG
    ctx.fillRect(0, 0, canvasWidth, HEADER_HEIGHT)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(0, HEADER_HEIGHT - 0.5, canvasWidth, 0.5)
    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(canvasWidth / 2 - 28, HEADER_HEIGHT / 2, 14, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `bold 11px "Noto Sans SC"`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('T', canvasWidth / 2 - 28, HEADER_HEIGHT / 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `600 15px "Noto Sans SC"`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('Textric Bot', canvasWidth / 2 - 8, HEADER_HEIGHT / 2 - 2)
    ctx.fillStyle = TIME_COLOR
    ctx.font = `11px "Noto Sans SC"`
    ctx.fillText('online', canvasWidth / 2 - 8, HEADER_HEIGHT / 2 + 14)

    let y = HEADER_HEIGHT + 16

    for (let i = 0; i < layout.length; i++) {
      const bubble = layout[i]
      const gap = bubble.sameGroup ? MSG_GAP : GROUP_GAP
      y += gap

      const isMe = bubble.isMe
      const textAreaX = isMe
        ? canvasWidth - SIDE_MARGIN - bubble.bubbleW
        : SIDE_MARGIN + AVATAR_SIZE + AVATAR_GAP
      const bx = textAreaX

      // Avatar (other, first in group)
      if (!isMe && !bubble.sameGroup) {
        ctx.fillStyle = '#3b82f6'
        ctx.beginPath()
        ctx.arc(SIDE_MARGIN + AVATAR_SIZE / 2, y + AVATAR_SIZE / 2, AVATAR_SIZE / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.font = `bold 13px "Noto Sans SC"`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('T', SIDE_MARGIN + AVATAR_SIZE / 2, y + AVATAR_SIZE / 2)
      }

      // Bubble
      ctx.fillStyle = isMe ? ME_COLOR : OTHER_COLOR
      ctx.beginPath()
      ctx.roundRect(bx, y, bubble.bubbleW, bubble.bubbleH, BUBBLE_RADIUS)
      ctx.fill()

      // Text lines
      ctx.fillStyle = isMe ? TEXT_COLOR_ME : TEXT_COLOR_OTHER
      ctx.font = `${fontSize}px "Noto Sans SC"`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      const textX = bx + BUBBLE_PX
      const textY = y + BUBBLE_PY
      bubble.lines.forEach((line, li) => {
        ctx.fillText(line, textX, textY + li * fontSize * 1.4)
      })

      // ── Metrics overlay ──
      const mAlpha = metricsOpacity.current
      if (mAlpha > 0.01) {
        const lineH = fontSize * 1.4

        // maxWidth limit line (red dashed) — bubble outer boundary
        // Yellow box should NEVER exceed this line
        const otherBubbleStartX = SIDE_MARGIN + AVATAR_SIZE + AVATAR_GAP
        const maxLineXPos = isMe
          ? canvasWidth - SIDE_MARGIN - maxBubbleWidth
          : otherBubbleStartX + maxBubbleWidth
        ctx.strokeStyle = mc(239,68,68,0.4,mAlpha)
        ctx.lineWidth = 1
        ctx.setLineDash([4, 3])
        ctx.beginPath()
        ctx.moveTo(maxLineXPos, y - 4)
        ctx.lineTo(maxLineXPos, y + bubble.bubbleH + 4)
        ctx.stroke()
        ctx.setLineDash([])

        // maxWidth label (above the line)
        ctx.fillStyle = mc(239,68,68,0.4,mAlpha)
        ctx.font = `${METRIC_FONT_SIZE}px "Noto Sans SC"`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(`limit: ${maxBubbleWidth}px`, maxLineXPos, y - 5)

        // Per-line width indicators — thin underline + label OUTSIDE the bubble
        bubble.lines.forEach((_line, li) => {
          const lw = bubble.lineWidths[li] ?? 0
          const ly = textY + li * lineH
          const lineBottom = ly + lineH - 3

          // Thin underline bar beneath the text line
          ctx.fillStyle = mc(52,211,153,0.35,mAlpha)
          ctx.fillRect(textX, lineBottom, lw, 2)

          // Width label — positioned outside the bubble on the opposite side
          ctx.fillStyle = mc(251,191,36,0.9,mAlpha)
          ctx.font = `${METRIC_FONT_SIZE}px "Noto Sans SC"`
          ctx.textBaseline = 'middle'
          const label = `${lw.toFixed(1)}`
          if (isMe) {
            // Label on the left side of the bubble
            ctx.textAlign = 'right'
            ctx.fillText(label, bx - 4, ly + lineH / 2)
          } else {
            // Label on the right side of the bubble
            ctx.textAlign = 'left'
            ctx.fillText(label, bx + bubble.bubbleW + 4, ly + lineH / 2)
          }
        })

        // Bubble bounding box (dashed amber)
        ctx.strokeStyle = mc(251,191,36,0.6,mAlpha)
        ctx.lineWidth = 1
        ctx.setLineDash([3, 2])
        ctx.strokeRect(bx + 0.5, y + 0.5, bubble.bubbleW - 1, bubble.bubbleH - 1)
        ctx.setLineDash([])

        // Bubble dimension label — below the bubble
        ctx.fillStyle = mc(251,191,36,0.6,mAlpha)
        ctx.font = `${METRIC_FONT_SIZE}px "Noto Sans SC"`
        ctx.textAlign = isMe ? 'right' : 'left'
        ctx.textBaseline = 'top'
        const dimLabel = `${bubble.bubbleW.toFixed(0)} × ${bubble.bubbleH.toFixed(0)} px`
        const dimX = isMe ? bx + bubble.bubbleW : bx
        ctx.fillText(dimLabel, dimX, y + bubble.bubbleH + 2)
      }

      // Time — shift down when metrics are shown to avoid overlap with dimension label
      const timeOffsetY = showMetrics ? 14 : 2
      ctx.fillStyle = TIME_COLOR
      ctx.font = `${TIME_FONT_SIZE}px "Noto Sans SC"`
      ctx.textAlign = isMe ? 'right' : 'left'
      ctx.textBaseline = 'top'
      const timeX = isMe ? canvasWidth - SIDE_MARGIN : textAreaX
      ctx.fillText(bubble.time, timeX, y + bubble.bubbleH + timeOffsetY)

      y += bubble.bubbleH + TIME_HEIGHT + (showMetrics ? 12 : 0)
    }
  }, [layout, fontLoaded, canvasWidth, totalHeight, fontSize, maxBubbleWidth])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) drawCanvas(canvas)
  }, [drawCanvas])

  // Animate metrics opacity on toggle
  useEffect(() => {
    const target = showMetrics ? 1 : 0
    const step = () => {
      const current = metricsOpacity.current
      const diff = target - current
      if (Math.abs(diff) < 0.01) {
        metricsOpacity.current = target
      } else {
        metricsOpacity.current += diff * 0.15
        animFrameRef.current = requestAnimationFrame(step)
      }
      const canvas = canvasRef.current
      if (canvas) drawCanvas(canvas)
    }
    animFrameRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [showMetrics, drawCanvas])

  const addMessage = (isMe: boolean) => {
    if (!newMsg.trim()) return
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setMessages(prev => [...prev, { text: newMsg.trim(), isMe, time }])
    setNewMsg('')
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'chat.png'
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  return (
    <DemoShell
      title="Chat Bubble"
      description="Textric measures each message to size the bubble precisely. Toggle metrics to see the math."
      controls={
        <>
          <div className="space-y-2">
            <Label>Font Size: {fontSize}px</Label>
            <Slider value={[fontSize]} onValueChange={(v) => setFontSize(typeof v === 'number' ? v : v[0])} min={10} max={24} />
          </div>
          <div className="space-y-2">
            <Label>Max Bubble Width: {maxBubbleWidth}px</Label>
            <Slider value={[maxBubbleWidth]} onValueChange={(v) => setMaxBubbleWidth(typeof v === 'number' ? v : v[0])} min={120} max={maxAllowedBubble} />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <Label htmlFor="show-metrics">Show Metrics</Label>
            <Switch id="show-metrics" checked={showMetrics} onCheckedChange={setShowMetrics} />
          </div>
          {showMetrics && (
            <div className="text-xs text-muted-foreground space-y-1 pl-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 rounded-sm" style={{ backgroundColor: 'rgba(52,211,153,0.35)' }} />
                Line width (px)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-2 rounded-sm border" style={{ borderColor: 'rgba(251,191,36,0.6)' }} />
                Bubble bounding box
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5" style={{ backgroundColor: 'rgba(239,68,68,0.4)' }} />
                textric maxWidth constraint
              </div>
            </div>
          )}

          <div className="border-t border-border pt-3 space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Add Message</Label>
            <Input
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={e => { if (e.key === 'Enter') addMessage(true) }}
            />
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => addMessage(false)}>
                As Other
              </Button>
              <Button size="sm" className="flex-1" onClick={() => addMessage(true)}>
                As Me
              </Button>
            </div>
          </div>

          <div className="border-t border-border pt-3 space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Messages ({messages.length})</Label>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {messages.map((msg, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${msg.isMe ? 'bg-blue-500' : 'bg-muted-foreground'}`} />
                  <span className="truncate text-muted-foreground">{msg.text}</span>
                  <button
                    onClick={() => setMessages(prev => prev.filter((_, j) => j !== i))}
                    className="ml-auto text-muted-foreground hover:text-destructive shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setMessages(defaultMessages)}>
              Reset
            </Button>
          </div>

          <Button onClick={handleDownload} className="w-full">
            Download PNG
          </Button>
        </>
      }
      preview={
        <div className="space-y-3">
          <div
            className="rounded-2xl overflow-hidden shadow-2xl border border-border/30"
            style={{ width: canvasWidth, height: totalHeight, transition: 'height 0.35s ease' }}
          >
            <canvas
              ref={canvasRef}
              style={{ width: canvasWidth, height: totalHeight, display: 'block' }}
            />
          </div>
          {layout && (
            <div className="font-mono text-xs text-muted-foreground space-y-0.5">
              <div>messages: <span className="text-emerald-400">{layout.length}</span></div>
              <div>total lines: <span className="text-emerald-400">{layout.reduce((s, b) => s + b.lineCount, 0)}</span></div>
              <div>canvas: <span className="text-emerald-400">{canvasWidth}×{totalHeight}</span></div>
            </div>
          )}
        </div>
      }
    />
  )
}
