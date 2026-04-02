'use client'

import { useState, useEffect } from 'react'
import { createMeasurer } from 'textric'

type Measurer = Awaited<ReturnType<typeof createMeasurer>>

let cachedMeasurer: Measurer | null = null
let loadingPromise: Promise<Measurer> | null = null

async function loadMeasurer(): Promise<Measurer> {
  if (cachedMeasurer) return cachedMeasurer
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    const [regular, bold] = await Promise.all([
      fetch('/fonts/Inter-Regular.ttf').then(r => r.arrayBuffer()),
      fetch('/fonts/Inter-Bold.ttf').then(r => r.arrayBuffer()),
    ])
    const m = await createMeasurer({
      fonts: [
        { family: 'Inter', data: new Uint8Array(regular), weight: 400 },
        { family: 'Inter', data: new Uint8Array(bold), weight: 700 },
      ],
    })
    cachedMeasurer = m
    return m
  })()

  return loadingPromise
}

export function useTextric() {
  const [measurer, setMeasurer] = useState<Measurer | null>(cachedMeasurer)

  useEffect(() => {
    if (!measurer) {
      loadMeasurer().then(setMeasurer)
    }
  }, [measurer])

  return measurer
}
