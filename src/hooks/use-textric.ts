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
    const [regular, bold, notoSC400, notoSC300, notoSC500, notoSC800, serif300, serif500, serif800] = await Promise.all([
      fetch('/fonts/Inter-Regular.ttf').then(r => r.arrayBuffer()),
      fetch('/fonts/Inter-Bold.ttf').then(r => r.arrayBuffer()),
      fetch('/fonts/NotoSansSC-Subset.ttf').then(r => r.arrayBuffer()),
      fetch('/fonts/NotoSansSC-300.ttf').then(r => r.arrayBuffer()),
      fetch('/fonts/NotoSansSC-500.ttf').then(r => r.arrayBuffer()),
      fetch('/fonts/NotoSansSC-800.ttf').then(r => r.arrayBuffer()),
      fetch('/fonts/NotoSerif-300.ttf').then(r => r.arrayBuffer()),
      fetch('/fonts/NotoSerif-500.ttf').then(r => r.arrayBuffer()),
      fetch('/fonts/NotoSerif-800.ttf').then(r => r.arrayBuffer()),
    ])
    const m = await createMeasurer({
      fonts: [
        { family: 'Inter', data: new Uint8Array(regular), weight: 400 },
        { family: 'Inter', data: new Uint8Array(bold), weight: 700 },
        { family: 'Noto Sans SC', data: new Uint8Array(notoSC400), weight: 400 },
        { family: 'Noto Sans SC', data: new Uint8Array(notoSC300), weight: 300 },
        { family: 'Noto Sans SC', data: new Uint8Array(notoSC500), weight: 500 },
        { family: 'Noto Sans SC', data: new Uint8Array(notoSC800), weight: 800 },
        { family: 'Noto Serif', data: new Uint8Array(serif300), weight: 300 },
        { family: 'Noto Serif', data: new Uint8Array(serif500), weight: 500 },
        { family: 'Noto Serif', data: new Uint8Array(serif800), weight: 800 },
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
