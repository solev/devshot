"use client"

import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Minus, Plus, RotateCcw } from 'lucide-react'

type Props = {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  unit?: string
  disabled?: boolean
  className?: string
  defaultValue?: number
  onReset?: () => void
}

export function EnhancedSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  disabled,
  className,
  defaultValue,
  onReset,
}: Props) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-medium", disabled ? "text-stone-400" : "text-stone-700")}>{label}</span>
        <div className="flex items-center gap-1">
          {typeof defaultValue === "number" ? (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-stone-500"
              disabled={disabled || value === defaultValue}
              onClick={() => (onReset ? onReset() : onChange(defaultValue))}
              aria-label={`Reset ${label}`}
              title="Reset"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          ) : null}
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            disabled={disabled}
            onClick={() => onChange(clamp(Number((value - step).toFixed(3))))}
            aria-label={`Decrease ${label}`}
            title="Decrease"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <div className="flex items-center gap-1">
            <Input
              disabled={disabled}
              value={Number(value.toFixed(2))}
              onChange={(e) => {
                const next = Number(e.target.value)
                if (!Number.isNaN(next)) onChange(clamp(next))
              }}
              className="h-8 w-20"
            />
            {unit ? <span className="text-xs text-stone-500">{unit}</span> : null}
          </div>
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            disabled={disabled}
            onClick={() => onChange(clamp(Number((value + step).toFixed(3))))}
            aria-label={`Increase ${label}`}
            title="Increase"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <Slider disabled={disabled} value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0] ?? value)} />
    </div>
  )
}
