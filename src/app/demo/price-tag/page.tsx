'use client'

import { useState, useEffect } from 'react'
import { DemoShell } from '@/components/demo-shell'
import { measurePriceTag } from './actions'

type PriceResult = Awaited<ReturnType<typeof measurePriceTag>>

export default function PriceTagPage() {
  const [currency, setCurrency] = useState('$')
  const [price, setPrice] = useState('49')
  const [decimals, setDecimals] = useState('.99')
  const [suffix, setSuffix] = useState('/mo')
  const [mainSize, setMainSize] = useState(48)
  const [smallSize, setSmallSize] = useState(18)
  const [containerWidth, setContainerWidth] = useState(400)
  const [result, setResult] = useState<PriceResult | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      measurePriceTag({ currency, price, decimals, suffix, mainSize, smallSize, containerWidth }).then(setResult)
    }, 100)
    return () => clearTimeout(timer)
  }, [currency, price, decimals, suffix, mainSize, smallSize, containerWidth])

  return (
    <DemoShell
      title="Price Tag Builder"
      description="Mixed font sizes with rich text layout. Drag the container width to see real-time reflow."
      controls={
        <>
          <label className="block">
            <span className="text-sm font-medium">Currency</span>
            <input value={currency} onChange={e => setCurrency(e.target.value)}
              className="mt-1 block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Price</span>
            <input value={price} onChange={e => setPrice(e.target.value)}
              className="mt-1 block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Decimals</span>
            <input value={decimals} onChange={e => setDecimals(e.target.value)}
              className="mt-1 block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Suffix</span>
            <input value={suffix} onChange={e => setSuffix(e.target.value)}
              className="mt-1 block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Main Size: {mainSize}px</span>
            <input type="range" min={24} max={96} value={mainSize} onChange={e => setMainSize(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Small Size: {smallSize}px</span>
            <input type="range" min={10} max={48} value={smallSize} onChange={e => setSmallSize(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Container: {containerWidth}px</span>
            <input type="range" min={100} max={800} value={containerWidth} onChange={e => setContainerWidth(+e.target.value)}
              className="mt-1 block w-full" />
          </label>
        </>
      }
      preview={
        <div className="space-y-4">
          {result && (
            <>
              <div className="border border-dashed border-zinc-300 dark:border-zinc-700 relative" style={{ width: containerWidth }}>
                <svg width={containerWidth} height={result.height + 10} className="block">
                  {result.lines.map((line, li) =>
                    line.fragments.map((frag, fi) => (
                      <text
                        key={`${li}-${fi}`}
                        x={frag.x}
                        y={line.baseline}
                        fontSize={frag.size}
                        fontWeight={frag.weight}
                        fontFamily="Inter"
                        fill="currentColor"
                      >
                        {frag.text}
                      </text>
                    ))
                  )}
                </svg>
              </div>
              <div className="text-xs font-mono text-zinc-500">
                {result.width.toFixed(1)}px x {result.height.toFixed(1)}px
              </div>
            </>
          )}
        </div>
      }
    />
  )
}
