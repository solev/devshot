"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Settings, Shuffle } from "lucide-react"
import { useImageStore } from "@/lib/store"
import { EnhancedSlider } from "./enhanced-slider"

export function GradientWavesConfig() {
  const { options, updateGradientWaves, randomizeGradientWaves } = useImageStore()
  const config = options.gradientWaves

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-3 text-xs bg-transparent">
          <Settings className="h-3 w-3 mr-1" />
          Configure
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gradient Waves Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Wave Parameters */}
          <div className="space-y-3">
            <EnhancedSlider
              label="lines"
              value={config.lines}
              onChange={(v) => updateGradientWaves({ lines: Math.round(v) })}
              min={5}
              max={50}
              step={1}
              defaultValue={29}
              onReset={() => updateGradientWaves({ lines: 29 })}
            />

            <EnhancedSlider
              label="amplitudeX"
              value={config.amplitudeX}
              onChange={(v) => updateGradientWaves({ amplitudeX: Math.round(v) })}
              min={20}
              max={200}
              step={1}
              defaultValue={100}
              onReset={() => updateGradientWaves({ amplitudeX: 100 })}
            />

            <EnhancedSlider
              label="amplitudeY"
              value={config.amplitudeY}
              onChange={(v) => updateGradientWaves({ amplitudeY: Math.round(v) })}
              min={5}
              max={50}
              step={1}
              defaultValue={20}
              onReset={() => updateGradientWaves({ amplitudeY: 20 })}
            />

            <EnhancedSlider
              label="offsetX"
              value={config.offsetX}
              onChange={(v) => updateGradientWaves({ offsetX: Math.round(v) })}
              min={0}
              max={30}
              step={1}
              defaultValue={10}
              onReset={() => updateGradientWaves({ offsetX: 10 })}
            />

            <EnhancedSlider
              label="smoothness"
              value={config.smoothness}
              onChange={(v) => updateGradientWaves({ smoothness: Math.round(v) })}
              min={1}
              max={10}
              step={1}
              defaultValue={3}
              onReset={() => updateGradientWaves({ smoothness: 3 })}
            />
          </div>

          {/* Checkboxes */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="crazyness"
              checked={config.crazyness}
              onCheckedChange={(checked) => updateGradientWaves({ crazyness: !!checked })}
            />
            <label htmlFor="crazyness" className="text-xs font-medium text-stone-700">
              crazyness
            </label>
          </div>

          <Separator />

          {/* Start Color */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-stone-800">Start Color</h4>

            <EnhancedSlider
              label="hueStartColor"
              value={config.hueStart}
              onChange={(v) => updateGradientWaves({ hueStart: Math.round(v) })}
              min={0}
              max={360}
              step={1}
              defaultValue={53}
              onReset={() => updateGradientWaves({ hueStart: 53 })}
            />

            <EnhancedSlider
              label="saturationStartC"
              value={config.saturationStart}
              onChange={(v) => updateGradientWaves({ saturationStart: Math.round(v) })}
              min={0}
              max={100}
              step={1}
              defaultValue={74}
              onReset={() => updateGradientWaves({ saturationStart: 74 })}
            />

            <EnhancedSlider
              label="lightnessStartC"
              value={config.lightnessStart}
              onChange={(v) => updateGradientWaves({ lightnessStart: Math.round(v) })}
              min={0}
              max={100}
              step={1}
              defaultValue={67}
              onReset={() => updateGradientWaves({ lightnessStart: 67 })}
            />
          </div>

          <Separator />

          {/* End Color */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-stone-800">End Color</h4>

            <EnhancedSlider
              label="hueEndColor"
              value={config.hueEnd}
              onChange={(v) => updateGradientWaves({ hueEnd: Math.round(v) })}
              min={0}
              max={360}
              step={1}
              defaultValue={216}
              onReset={() => updateGradientWaves({ hueEnd: 216 })}
            />

            <EnhancedSlider
              label="saturationEndC"
              value={config.saturationEnd}
              onChange={(v) => updateGradientWaves({ saturationEnd: Math.round(v) })}
              min={0}
              max={100}
              step={1}
              defaultValue={100}
              onReset={() => updateGradientWaves({ saturationEnd: 100 })}
            />

            <EnhancedSlider
              label="lightnessEndColor"
              value={config.lightnessEnd}
              onChange={(v) => updateGradientWaves({ lightnessEnd: Math.round(v) })}
              min={0}
              max={100}
              step={1}
              defaultValue={7}
              onReset={() => updateGradientWaves({ lightnessEnd: 7 })}
            />
          </div>

          <Separator />

          {/* Randomize Button */}
          <Button onClick={randomizeGradientWaves} variant="outline" className="w-full bg-transparent">
            <Shuffle className="h-4 w-4 mr-2" />
            randomize
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
