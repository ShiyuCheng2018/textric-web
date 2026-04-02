'use server'

import { getMeasurer } from '@/lib/textric'

export async function layoutRichSVG(formData: {
  spans: Array<{ text: string; size: number; weight: number }>
  maxWidth: number
  lineHeight: number
  showBaselines: boolean
}) {
  const m = await getMeasurer()
  const richSpans = formData.spans.map(s => ({
    text: s.text, font: 'Inter', size: s.size, weight: s.weight,
  }))

  const result = m.measureRichText(richSpans, {
    maxWidth: formData.maxWidth, lineHeight: formData.lineHeight,
  })

  return {
    width: result.width,
    height: result.height,
    lineCount: result.lineCount,
    lines: result.lines.map(line => ({
      y: line.y,
      baseline: line.baseline,
      ascent: line.ascent,
      descent: line.descent,
      height: line.height,
      width: line.width,
      fragments: line.fragments.map(f => ({
        text: f.text, x: f.x, width: f.width,
        size: f.size, weight: f.weight,
      })),
    })),
  }
}
