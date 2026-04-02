import { createMeasurer } from 'textric'
import { readFile } from 'fs/promises'
import { join } from 'path'

let measurerPromise: ReturnType<typeof createMeasurer> | null = null

export function getMeasurer() {
  if (!measurerPromise) {
    measurerPromise = (async () => {
      return createMeasurer({
        fonts: [
          { family: 'Inter', data: await readFile(join(process.cwd(), 'public/fonts/Inter-Regular.ttf')), weight: 400 },
          { family: 'Inter', data: await readFile(join(process.cwd(), 'public/fonts/Inter-Bold.ttf')), weight: 700 },
          { family: 'Noto Sans SC', data: await readFile(join(process.cwd(), 'public/fonts/NotoSansSC-Subset.ttf')), weight: 400 },
        ],
      })
    })()
  }
  return measurerPromise
}
