'use server'

import { getMeasurer } from '@/lib/textric'

export async function layoutOGImage(formData: {
  title: string
  subtitle: string
  titleSize: number
  subtitleSize: number
  width: number
  height: number
  padding: number
}) {
  const m = await getMeasurer()
  const contentWidth = formData.width - formData.padding * 2

  const titleResult = m.measure(formData.title, {
    font: 'Inter', size: formData.titleSize, weight: 700,
    maxWidth: contentWidth, lineHeight: 1.2,
  })

  const subtitleResult = m.measure(formData.subtitle, {
    font: 'Inter', size: formData.subtitleSize, weight: 400,
    maxWidth: contentWidth, lineHeight: 1.4,
  })

  const titleFit = m.fitText(formData.title, {
    font: 'Inter', maxWidth: contentWidth,
    maxHeight: formData.height * 0.5, weight: 700, lineHeight: 1.2,
  })

  return {
    title: {
      lines: titleResult.lines,
      width: titleResult.width,
      height: titleResult.height,
      lineCount: titleResult.lineCount,
    },
    subtitle: {
      lines: subtitleResult.lines,
      width: subtitleResult.width,
      height: subtitleResult.height,
    },
    fitTitle: {
      size: titleFit.size,
      lines: titleFit.lines,
      height: titleFit.height,
    },
    canvas: { width: formData.width, height: formData.height, padding: formData.padding },
  }
}
