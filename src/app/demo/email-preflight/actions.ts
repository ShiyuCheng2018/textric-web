'use server'

import { getMeasurer } from '@/lib/textric'

interface PreflightItem {
  label: string
  text: string
  maxWidth: number
  size: number
  weight: number
  maxLines?: number
}

export async function preflightEmail(items: PreflightItem[]) {
  const m = await getMeasurer()

  return items.map(item => {
    const result = m.measure(item.text, {
      font: 'Inter', size: item.size, weight: item.weight,
      maxWidth: item.maxWidth, lineHeight: 1.4,
      maxLines: item.maxLines,
    })

    const singleLine = m.measure(item.text, {
      font: 'Inter', size: item.size, weight: item.weight,
    })

    return {
      label: item.label,
      text: item.text,
      maxWidth: item.maxWidth,
      measuredWidth: singleLine.width,
      fits: singleLine.width <= item.maxWidth,
      lineCount: result.lineCount,
      totalLineCount: result.totalLineCount,
      truncated: result.truncated,
      lines: result.lines,
      height: result.height,
    }
  })
}
