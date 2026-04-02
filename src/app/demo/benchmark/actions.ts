'use server'

import { getMeasurer } from '@/lib/textric'

export async function runBenchmark(formData: {
  counts: number[]
  text: string
  size: number
  maxWidth: number
}) {
  const m = await getMeasurer()
  const results: Array<{ count: number; durationMs: number; opsPerSec: number }> = []

  for (const count of formData.counts) {
    const start = performance.now()
    for (let i = 0; i < count; i++) {
      m.measure(formData.text, {
        font: 'Inter', size: formData.size, maxWidth: formData.maxWidth,
      })
    }
    const durationMs = performance.now() - start

    results.push({
      count,
      durationMs: Math.round(durationMs * 100) / 100,
      opsPerSec: Math.round(count / (durationMs / 1000)),
    })
  }

  return results
}
