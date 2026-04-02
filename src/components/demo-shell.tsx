import { Separator } from '@/components/ui/separator'

interface DemoShellProps {
  title: string
  description: string
  controls: React.ReactNode
  preview: React.ReactNode
}

export function DemoShell({ title, description, controls, preview }: DemoShellProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      <div className="px-6 py-3 border-b border-border/50">
        <h1 className="text-sm font-semibold font-mono">{title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 shrink-0 border-r border-border/50 p-4 overflow-y-auto space-y-4 bg-card/50">
          {controls}
        </div>
        <div className="flex-1 overflow-auto flex items-start justify-center p-6 bg-[radial-gradient(circle,_var(--border)_1px,_transparent_1px)] bg-[length:24px_24px]">
          {preview}
        </div>
      </div>
    </div>
  )
}
