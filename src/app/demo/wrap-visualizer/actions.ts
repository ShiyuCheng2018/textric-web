'use server'

import { getMeasurer } from '@/lib/textric'

export async function visualizeWrap(formData: {
  text: string
  size: number
  weight: number
  maxWidth: number
  lineHeight: number
}) {
  const m = await getMeasurer()

  const result = m.measure(formData.text, {
    font: 'Inter', size: formData.size, weight: formData.weight,
    maxWidth: formData.maxWidth, lineHeight: formData.lineHeight,
  })

  // Also measure each line to get precise widths
  const lineDetails = result.lines.map((line, i) => {
    const lineMeasure = m.measure(line, { font: 'Inter', size: formData.size, weight: formData.weight })
    return {
      text: line,
      width: result.lineWidths[i]!,
      fullWidth: lineMeasure.width,
      chars: [...line],
    }
  })

  return {
    lines: lineDetails,
    lineCount: result.lineCount,
    totalLineCount: result.totalLineCount,
    truncated: result.truncated,
    height: result.height,
    maxLineWidth: result.width,
  }
}
