"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  className?: string
  value?: number[]
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  onValueChange?: (value: number | number[], activeThumbIndex: number, event: Event) => void
}

function Slider({
  className,
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  onValueChange,
  ...props
}: SliderProps) {
  const currentValue = value?.[0] ?? defaultValue?.[0] ?? min

  return (
    <div
      data-slot="slider"
      className={cn("relative flex w-full touch-none items-center select-none", className)}
    >
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        disabled={disabled}
        onChange={(e) => {
          const val = Number(e.target.value)
          onValueChange?.(val, 0, e.nativeEvent)
        }}
        className={cn(
          "w-full h-1 appearance-none cursor-pointer rounded-full bg-muted outline-none disabled:opacity-50 disabled:cursor-not-allowed",
          "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-ring [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:ring-3 [&::-webkit-slider-thumb]:hover:ring-ring/50 [&::-webkit-slider-thumb]:active:ring-3 [&::-webkit-slider-thumb]:active:ring-ring/50",
          "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-ring [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:transition-shadow"
        )}
      />
    </div>
  )
}

export { Slider }
