'use server'

import { getMeasurer } from '@/lib/textric'

export async function measureText(formData: {
  text: string
  size: number
  weight: number
  maxWidth: number | null
  lineHeight: number
}) {
  const m = await getMeasurer()

  if (formData.maxWidth) {
    const result = m.measure(formData.text, {
      font: 'Inter',
      size: formData.size,
      weight: formData.weight,
      maxWidth: formData.maxWidth,
      lineHeight: formData.lineHeight,
    })
    return {
      mode: 'multi' as const,
      width: result.width,
      height: result.height,
      lines: result.lines,
      lineWidths: result.lineWidths,
      lineCount: result.lineCount,
      truncated: result.truncated,
    }
  }

  const result = m.measure(formData.text, {
    font: 'Inter',
    size: formData.size,
    weight: formData.weight,
    lineHeight: formData.lineHeight,
  })
  return {
    mode: 'single' as const,
    width: result.width,
    height: result.height,
    ascent: result.ascent,
    descent: result.descent,
  }
}
