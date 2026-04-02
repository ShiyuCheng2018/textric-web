interface DemoShellProps {
  title: string
  description: string
  controls: React.ReactNode
  preview: React.ReactNode
}

export function DemoShell({ title, description, controls, preview }: DemoShellProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-zinc-500 mt-1">{description}</p>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 shrink-0 border-r border-zinc-200 dark:border-zinc-800 p-4 overflow-y-auto space-y-4">
          {controls}
        </div>
        <div className="flex-1 p-6 overflow-auto flex items-start justify-center">
          {preview}
        </div>
      </div>
    </div>
  )
}
