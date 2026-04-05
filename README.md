# Textric Demo

Interactive demos for [Textric](https://github.com/ShiyuCheng2018/textric) — text layout for AI.

## Demos

| Demo | What it shows |
|------|--------------|
| **AI Streaming** | Split-view: Traditional DOM forced reflows vs Textric zero-reflow prediction |
| **Poster Editor** | `fitText` auto-sizing + drag-to-resize with real-time reflow |
| **Chat Bubble** | Canvas-rendered chat bubbles with `measure()` + truncation detection |
| **Rich Text** | `measureRichText` — mixed fonts/sizes aligned on shared baseline |
| **Wrap Visualizer** | Line-break decisions and per-line widths visualized |
| **Benchmark** | 100–20K `measure()` calls — real throughput numbers |

## Local Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- [Next.js](https://nextjs.org) 16
- [Textric](https://github.com/ShiyuCheng2018/textric) — text layout engine
- [Tailwind CSS](https://tailwindcss.com) 4
- [shadcn/ui](https://ui.shadcn.com) components

## Links

- [Textric GitHub](https://github.com/ShiyuCheng2018/textric)
- [API Reference](https://github.com/ShiyuCheng2018/textric/tree/main/docs/api)
- [npm](https://www.npmjs.com/package/textric)
