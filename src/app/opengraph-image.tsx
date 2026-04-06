import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Textric — Text Layout for AI'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #111118 50%, #0a0a0f 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6)',
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.04em',
            display: 'flex',
          }}
        >
          textric — Text layout for AI
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.5)',
            marginTop: 16,
            display: 'flex',
          }}
        >
          Use Pretext in the browser. Use Textric everywhere else.
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 40,
          }}
        >
          {['Line Wrapping', 'Rich Text', 'Precise Metrics', 'Pure JS', 'No Browser'].map(
            (label) => (
              <div
                key={label}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 18,
                  color: 'rgba(255,255,255,0.7)',
                  display: 'flex',
                }}
              >
                {label}
              </div>
            ),
          )}
        </div>

        {/* Code snippet */}
        <div
          style={{
            marginTop: 40,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '20px 32px',
            fontSize: 20,
            color: '#10b981',
            fontFamily: 'monospace',
            display: 'flex',
          }}
        >
          npm install textric
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            fontSize: 16,
            color: 'rgba(255,255,255,0.25)',
            display: 'flex',
          }}
        >
          github.com/ShiyuCheng2018/textric
        </div>
      </div>
    ),
    { ...size },
  )
}
