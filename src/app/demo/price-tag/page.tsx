'use client'

import { useState, useMemo } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useTextric } from '@/hooks/use-textric'

export default function PriceTagPage() {
  const m = useTextric()
  const [currency, setCurrency] = useState('$')
  const [price, setPrice] = useState('49')
  const [decimals, setDecimals] = useState('.99')
  const [suffix, setSuffix] = useState('/mo')
  const [mainSize, setMainSize] = useState(48)
  const [smallSize, setSmallSize] = useState(18)
  const [containerWidth, setContainerWidth] = useState(400)

  const result = useMemo(() => {
    if (!m) return null
    const spans = [
      { text: currency, font: 'Noto Sans SC', size: smallSize, weight: 400 },
      { text: price, font: 'Noto Sans SC', size: mainSize, weight: 700 },
      { text: decimals, font: 'Noto Sans SC', size: smallSize, weight: 400 },
    ]
    if (suffix) {
      spans.push({ text: suffix, font: 'Noto Sans SC', size: smallSize, weight: 400 })
    }
    const r = m.measureRichText(spans, { maxWidth: containerWidth })
    return {
      width: r.width,
      height: r.height,
      lines: r.lines.map(line => ({
        y: line.y,
        baseline: line.baseline,
        height: line.height,
        fragments: line.fragments.map(f => ({
          text: f.text, x: f.x, width: f.width, size: f.size, weight: f.weight,
        })),
      })),
    }
  }, [m, currency, price, decimals, suffix, mainSize, smallSize, containerWidth])

  return (
    <DemoShell
      title="Price Tag Builder"
      description="Mixed font sizes with rich text layout. Drag the container width to see real-time reflow."
      controls={
        <>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" value={currency} onChange={e => setCurrency(e.target.value)} className="font-mono" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" value={price} onChange={e => setPrice(e.target.value)} className="font-mono" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="decimals">Decimals</Label>
            <Input id="decimals" value={decimals} onChange={e => setDecimals(e.target.value)} className="font-mono" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="suffix">Suffix</Label>
            <Input id="suffix" value={suffix} onChange={e => setSuffix(e.target.value)} className="font-mono" />
          </div>
          <div className="space-y-2">
            <Label>Main Size: {mainSize}px</Label>
            <Slider value={[mainSize]} onValueChange={(v) => setMainSize(typeof v === 'number' ? v : v[0])} min={24} max={96} />
          </div>
          <div className="space-y-2">
            <Label>Small Size: {smallSize}px</Label>
            <Slider value={[smallSize]} onValueChange={(v) => setSmallSize(typeof v === 'number' ? v : v[0])} min={10} max={48} />
          </div>
          <div className="space-y-2">
            <Label>Container: {containerWidth}px</Label>
            <Slider value={[containerWidth]} onValueChange={(v) => setContainerWidth(typeof v === 'number' ? v : v[0])} min={100} max={800} />
          </div>
        </>
      }
      preview={
        <div className="space-y-4">
          {result && (
            <>
              <div className="border border-dashed border-border relative" style={{ width: containerWidth }}>
                <svg width={containerWidth} height={result.height + 10} className="block">
                  {result.lines.map((line, li) =>
                    line.fragments.map((frag, fi) => (
                      <text
                        key={`${li}-${fi}`}
                        x={frag.x}
                        y={line.baseline}
                        fontSize={frag.size}
                        fontWeight={frag.weight}
                        fontFamily="Noto Sans SC"
                        fill="currentColor"
                      >
                        {frag.text}
                      </text>
                    ))
                  )}
                </svg>
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                {result.width.toFixed(1)}px x {result.height.toFixed(1)}px
              </div>
            </>
          )}
        </div>
      }
    />
  )
}
