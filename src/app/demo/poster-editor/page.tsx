'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useTextric } from '@/hooks/use-textric'

interface TextBlock {
  id: string
  text: string
  x: number
  y: number
  width: number
  height: number
  weight: number
  color: string
  label: string
}

const CANVAS_W = 540
const CANVAS_H = 720
const HANDLE_SIZE = 8
const MIN_SIZE = 40

const defaultBlocks: TextBlock[] = [
  { id: 'title', text: 'Textric', x: 40, y: 50, width: 460, height: 90, weight: 700, color: '#ffffff', label: 'Title' },
  { id: 'subtitle', text: 'Text Layout for AI', x: 40, y: 155, width: 460, height: 50, weight: 400, color: '#a1a1aa', label: 'Subtitle' },
  { id: 'body', text: 'Line wrapping, rich text, and precise metrics — pure JavaScript, no browser required. Perfect for server-side rendering, image generation, and Canvas applications.', x: 40, y: 230, width: 340, height: 200, weight: 400, color: '#d4d4d8', label: 'Body' },
]

type Corner = 'tl' | 'tr' | 'bl' | 'br'
type DragMode = null
  | { type: 'move'; blockId: string; offsetX: number; offsetY: number }
  | { type: 'resize'; blockId: string; corner: Corner; startMouseX: number; startMouseY: number; startX: number; startY: number; startW: number; startH: number }

export default function PosterEditorPage() {
  const m = useTextric()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fontLoaded, setFontLoaded] = useState(false)
  const [blocks, setBlocks] = useState<TextBlock[]>(defaultBlocks)
  const [selectedId, setSelectedId] = useState<string | null>('body')
  const [dragMode, setDragMode] = useState<DragMode>(null)

  useEffect(() => {
    const font = new FontFace('Noto Sans SC', 'url(/fonts/NotoSansSC-Subset.ttf)')
    font.load().then(f => {
      document.fonts.add(f)
      setFontLoaded(true)
    })
  }, [])

  // fitText for each block — textric finds optimal font size
  const measured = useCallback(() => {
    if (!m) return null
    return blocks.map(block => {
      const fit = m.fitText(block.text, {
        font: 'Noto Sans SC',
        maxWidth: block.width,
        maxHeight: block.height,
        weight: block.weight,
        lineHeight: 1.35,
      })
      return {
        ...block,
        computedSize: fit.size,
        lines: fit.lines,
        textW: fit.width,
        textH: fit.height,
        lineCount: fit.lineCount,
      }
    })
  }, [m, blocks])

  const drawCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const data = measured()
    if (!data || !fontLoaded) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = CANVAS_W * dpr
    canvas.height = CANVAS_H * dpr
    ctx.scale(dpr, dpr)

    // Background
    const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H)
    grad.addColorStop(0, '#0f0f23')
    grad.addColorStop(0.5, '#1a1a2e')
    grad.addColorStop(1, '#16213e')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    ctx.lineWidth = 1
    for (let gx = 0; gx <= CANVAS_W; gx += 20) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, CANVAS_H); ctx.stroke()
    }
    for (let gy = 0; gy <= CANVAS_H; gy += 20) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(CANVAS_W, gy); ctx.stroke()
    }

    for (const block of data) {
      const isSelected = block.id === selectedId
      const lineH = block.computedSize * 1.35

      // Draw text
      ctx.fillStyle = block.color
      ctx.font = `${block.weight} ${block.computedSize}px "Noto Sans SC"`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      block.lines.forEach((line, i) => {
        ctx.fillText(line, block.x, block.y + i * lineH)
      })

      if (isSelected) {
        // Container box — clean solid border
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'
        ctx.lineWidth = 1
        ctx.setLineDash([])
        ctx.strokeRect(block.x - 0.5, block.y - 0.5, block.width + 1, block.height + 1)

        // Corner handles
        const corners = [
          [block.x, block.y],
          [block.x + block.width, block.y],
          [block.x, block.y + block.height],
          [block.x + block.width, block.y + block.height],
        ]
        corners.forEach(([cx, cy]) => {
          ctx.fillStyle = '#3b82f6'
          ctx.fillRect(cx - HANDLE_SIZE / 2, cy - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE)
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(cx - HANDLE_SIZE / 2 + 1.5, cy - HANDLE_SIZE / 2 + 1.5, HANDLE_SIZE - 3, HANDLE_SIZE - 3)
        })

        // Compact info badge — bottom-left, outside the box
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        const badgeText = `${block.width}×${block.height}  →  ${block.computedSize}px`
        ctx.font = `10px "Noto Sans SC"`
        const badgeW = ctx.measureText(badgeText).width + 12
        const badgeX = block.x
        const badgeY = block.y + block.height + 4
        ctx.beginPath()
        ctx.roundRect(badgeX, badgeY, badgeW, 18, 4)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(badgeText, badgeX + 6, badgeY + 9)

      }
    }
  }, [measured, fontLoaded, selectedId])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) drawCanvas(canvas)
  }, [drawCanvas])

  const getCanvasPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (CANVAS_W / rect.width),
      y: (e.clientY - rect.top) * (CANVAS_H / rect.height),
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getCanvasPos(e)
    const data = measured()
    if (!data) return

    // Corner handles
    if (selectedId) {
      const sel = data.find(b => b.id === selectedId)
      if (sel) {
        const cornerDefs: [number, number, Corner][] = [
          [sel.x, sel.y, 'tl'],
          [sel.x + sel.width, sel.y, 'tr'],
          [sel.x, sel.y + sel.height, 'bl'],
          [sel.x + sel.width, sel.y + sel.height, 'br'],
        ]
        for (const [cx, cy, corner] of cornerDefs) {
          if (Math.abs(pos.x - cx) < 10 && Math.abs(pos.y - cy) < 10) {
            setDragMode({ type: 'resize', blockId: sel.id, corner, startMouseX: pos.x, startMouseY: pos.y, startX: sel.x, startY: sel.y, startW: sel.width, startH: sel.height })
            return
          }
        }
      }
    }

    // Block hit
    for (let i = data.length - 1; i >= 0; i--) {
      const b = data[i]
      if (pos.x >= b.x && pos.x <= b.x + b.width && pos.y >= b.y && pos.y <= b.y + b.height) {
        setSelectedId(b.id)
        setDragMode({ type: 'move', blockId: b.id, offsetX: pos.x - b.x, offsetY: pos.y - b.y })
        return
      }
    }
    setSelectedId(null)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragMode) {
      const canvas = canvasRef.current
      if (!canvas) return
      const pos = getCanvasPos(e)
      const data = measured()
      if (!data || !selectedId) return
      const sel = data.find(b => b.id === selectedId)
      if (sel) {
        const cursorMap: Record<Corner, string> = { tl: 'nwse-resize', tr: 'nesw-resize', bl: 'nesw-resize', br: 'nwse-resize' }
        const cornerDefs: [number, number, Corner][] = [
          [sel.x, sel.y, 'tl'],
          [sel.x + sel.width, sel.y, 'tr'],
          [sel.x, sel.y + sel.height, 'bl'],
          [sel.x + sel.width, sel.y + sel.height, 'br'],
        ]
        let cursor = 'default'
        for (const [cx, cy, c] of cornerDefs) {
          if (Math.abs(pos.x - cx) < 10 && Math.abs(pos.y - cy) < 10) { cursor = cursorMap[c]; break }
        }
        canvas.style.cursor = cursor
      }
      return
    }

    const pos = getCanvasPos(e)
    if (dragMode.type === 'move') {
      setBlocks(prev => prev.map(b =>
        b.id === dragMode.blockId
          ? { ...b, x: Math.max(0, Math.min(CANVAS_W - b.width, pos.x - dragMode.offsetX)), y: Math.max(0, Math.min(CANVAS_H - b.height, pos.y - dragMode.offsetY)) }
          : b
      ))
    } else if (dragMode.type === 'resize') {
      const dx = pos.x - dragMode.startMouseX
      const dy = pos.y - dragMode.startMouseY
      const { corner, startX, startY, startW, startH } = dragMode

      let newX = startX, newY = startY, newW = startW, newH = startH

      if (corner === 'br') {
        newW = Math.max(MIN_SIZE, startW + dx)
        newH = Math.max(MIN_SIZE, startH + dy)
      } else if (corner === 'bl') {
        newW = Math.max(MIN_SIZE, startW - dx)
        newH = Math.max(MIN_SIZE, startH + dy)
        newX = startX + startW - newW
      } else if (corner === 'tr') {
        newW = Math.max(MIN_SIZE, startW + dx)
        newH = Math.max(MIN_SIZE, startH - dy)
        newY = startY + startH - newH
      } else if (corner === 'tl') {
        newW = Math.max(MIN_SIZE, startW - dx)
        newH = Math.max(MIN_SIZE, startH - dy)
        newX = startX + startW - newW
        newY = startY + startH - newH
      }

      // Clamp
      newX = Math.max(0, newX)
      newY = Math.max(0, newY)
      newW = Math.min(CANVAS_W - newX, newW)
      newH = Math.min(CANVAS_H - newY, newH)

      setBlocks(prev => prev.map(b =>
        b.id === dragMode.blockId
          ? { ...b, x: Math.round(newX), y: Math.round(newY), width: Math.round(newW), height: Math.round(newH) }
          : b
      ))
    }
  }

  const handleMouseUp = () => setDragMode(null)

  const selectedBlock = blocks.find(b => b.id === selectedId)
  const selectedMeasured = measured()?.find(b => b.id === selectedId)

  const updateSelected = (field: string, value: string | number) => {
    if (!selectedId) return
    setBlocks(prev => prev.map(b => b.id === selectedId ? { ...b, [field]: value } : b))
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const prevSelected = selectedId
    setSelectedId(null)
    requestAnimationFrame(() => {
      canvas.toBlob(blob => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'poster.png'
        a.click()
        URL.revokeObjectURL(url)
        setSelectedId(prevSelected)
      }, 'image/png')
    })
  }

  return (
    <DemoShell
      title="Poster Editor"
      description="Drag corners to resize — fitText finds the optimal font size to fill the box."
      controls={
        <>
          {selectedBlock && selectedMeasured ? (
            <>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{selectedBlock.label}</div>

              <div className="space-y-2">
                <Label>Text</Label>
                <textarea
                  value={selectedBlock.text}
                  onChange={e => updateSelected('text', e.target.value)}
                  rows={3}
                  className="w-full bg-input/30 border border-border text-sm rounded-lg font-mono resize-none p-3 focus:ring-1 focus:ring-ring focus:outline-none"
                />
              </div>

              {/* fitText result */}
              <div className="bg-card border border-border rounded-lg p-3 space-y-1.5">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">fitText Result</div>
                <div className="font-mono text-xs space-y-0.5">
                  <div className="text-muted-foreground">container: <span className="text-emerald-400">{selectedBlock.width} × {selectedBlock.height}px</span></div>
                  <div className="text-muted-foreground">computed size: <span className="text-emerald-400 text-sm font-bold">{selectedMeasured.computedSize}px</span></div>
                  <div className="text-muted-foreground">lines: <span className="text-emerald-400">{selectedMeasured.lineCount}</span></div>
                  <div className="text-muted-foreground">text area: <span className="text-emerald-400">{selectedMeasured.textW.toFixed(0)} × {selectedMeasured.textH.toFixed(0)}px</span></div>
                </div>
              </div>

              <Button variant="secondary" size="sm" className="w-full"
                onClick={() => {
                  if (!m || !selectedId) return
                  const bm = measured()?.find(b => b.id === selectedId)
                  if (!bm) return
                  // Shrink width to actual text width at current fitText size
                  updateSelected('width', Math.ceil(bm.textW))
                }}>
                Shrink Wrap
              </Button>

              <div className="space-y-2">
                <Label>Weight</Label>
                <div className="flex gap-2">
                  {[400, 700].map(w => (
                    <Button key={w} size="sm" variant={selectedBlock.weight === w ? 'default' : 'secondary'}
                      onClick={() => updateSelected('weight', w)} className="flex-1">
                      {w === 400 ? 'Regular' : 'Bold'}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {['#ffffff', '#a1a1aa', '#d4d4d8', '#3b82f6', '#f59e0b', '#10b981'].map(c => (
                    <button key={c} onClick={() => updateSelected('color', c)}
                      className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                      style={{ backgroundColor: c, borderColor: selectedBlock.color === c ? '#fff' : 'transparent' }} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground py-8 text-center">
              Click a text block to select it
            </div>
          )}

          <div className="border-t border-border pt-3 space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Layers</Label>
            {blocks.map(b => {
              const bm = measured()?.find(x => x.id === b.id)
              return (
                <button key={b.id} onClick={() => setSelectedId(b.id)}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${b.id === selectedId ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'}`}>
                  {b.label}
                  {bm && <span className="ml-2 font-mono text-xs opacity-50">{bm.computedSize}px</span>}
                </button>
              )
            })}
          </div>


          <Button onClick={handleDownload} className="w-full">
            Download PNG
          </Button>
        </>
      }
      preview={
        <div className="space-y-3">
          <div className="rounded-lg overflow-hidden shadow-2xl border border-border/30">
            <canvas
              ref={canvasRef}
              style={{ width: CANVAS_W, height: CANVAS_H, display: 'block', cursor: dragMode?.type === 'resize' ? 'grabbing' : dragMode?.type === 'move' ? 'grabbing' : 'default' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        </div>
      }
    />
  )
}
