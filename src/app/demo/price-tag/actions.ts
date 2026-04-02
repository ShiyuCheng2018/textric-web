'use server'

import { getMeasurer } from '@/lib/textric'

export async function measurePriceTag(formData: {
  currency: string
  price: string
  decimals: string
  suffix: string
  mainSize: number
  smallSize: number
  containerWidth: number
}) {
  const m = await getMeasurer()
  const spans = [
    { text: formData.currency, font: 'Inter', size: formData.smallSize, weight: 400 },
    { text: formData.price, font: 'Inter', size: formData.mainSize, weight: 700 },
    { text: formData.decimals, font: 'Inter', size: formData.smallSize, weight: 400 },
  ]
  if (formData.suffix) {
    spans.push({ text: formData.suffix, font: 'Inter', size: formData.smallSize, weight: 400 })
  }

  const result = m.measureRichText(spans, { maxWidth: formData.containerWidth })
  return {
    width: result.width,
    height: result.height,
    lines: result.lines.map(line => ({
      y: line.y,
      baseline: line.baseline,
      height: line.height,
      fragments: line.fragments.map(f => ({
        text: f.text,
        x: f.x,
        width: f.width,
        size: f.size,
        weight: f.weight,
      })),
    })),
  }
}
