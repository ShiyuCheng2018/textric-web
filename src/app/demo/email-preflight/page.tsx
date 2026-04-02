'use client'

import { useState, useMemo } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { useTextric } from '@/hooks/use-textric'

const defaultItems = [
  { label: 'Subject Line', text: 'Your Pro subscription has been renewed successfully', maxWidth: 400, size: 16, weight: 700 },
  { label: 'Preheader', text: 'Next billing date: April 30, 2026. Manage your subscription in settings.', maxWidth: 500, size: 14, weight: 400 },
  { label: 'CTA Button', text: 'View Invoice', maxWidth: 200, size: 16, weight: 700 },
  { label: 'Footer Link', text: 'Unsubscribe from marketing emails', maxWidth: 280, size: 12, weight: 400 },
]

export default function EmailPreflightPage() {
  const m = useTextric()
  const [items, setItems] = useState(defaultItems)

  const results = useMemo(() => {
    if (!m) return null
    return items.map(item => {
      const result = m.measure(item.text, { font: 'Noto Sans SC', size: item.size, weight: item.weight, maxWidth: item.maxWidth, lineHeight: 1.4 })
      const singleLine = m.measure(item.text, { font: 'Noto Sans SC', size: item.size, weight: item.weight })
      return {
        label: item.label, text: item.text, maxWidth: item.maxWidth,
        measuredWidth: singleLine.width, fits: singleLine.width <= item.maxWidth,
        lineCount: result.lineCount, totalLineCount: result.totalLineCount,
        truncated: result.truncated, lines: result.lines, height: result.height,
      }
    })
  }, [m, items])

  const updateItem = (i: number, field: string, value: string | number) => {
    setItems(prev => prev.map((item, j) => j === i ? { ...item, [field]: value } : item))
  }

  return (
    <DemoShell
      title="Email Template Preflight"
      description="Check if text fits in fixed-width email containers. Red = overflow, green = fits."
      controls={
        <>
          {items.map((item, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-3 space-y-3">
              <div className="text-xs font-medium text-muted-foreground">{item.label}</div>
              <Input
                value={item.text}
                onChange={e => updateItem(i, 'text', e.target.value)}
                className="text-sm"
              />
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Container: {item.maxWidth}px
                </Label>
                <Slider
                  value={[item.maxWidth]}
                  onValueChange={(v) => updateItem(i, 'maxWidth', typeof v === 'number' ? v : v[0])}
                  min={100}
                  max={600}
                />
              </div>
            </div>
          ))}
        </>
      }
      preview={
        <div className="space-y-6 w-full max-w-xl">
          {results?.map((r, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`inline-block w-3 h-3 rounded-full ${r.fits ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-medium ${r.fits ? 'text-emerald-400' : 'text-red-400'}`}>{r.label}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {r.measuredWidth.toFixed(0)}px / {r.maxWidth}px
                </span>
              </div>
              <div className="relative bg-card border border-border rounded-lg overflow-hidden" style={{ width: r.maxWidth }}>
                <div className="p-3"
                  style={{ fontSize: items[i]!.size, fontWeight: items[i]!.weight, fontFamily: 'Noto Sans SC' }}>
                  {r.lines.join(' ')}
                  {r.truncated && <span className="text-xs text-red-400">...</span>}
                </div>
                {!r.fits && (
                  <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-destructive/20 to-transparent" />
                )}
              </div>
              {r.truncated && (
                <div className="text-xs text-red-400">
                  Truncated: {r.lineCount}/{r.totalLineCount} lines shown
                </div>
              )}
            </div>
          ))}
        </div>
      }
    />
  )
}
