"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useImageStore } from "@/lib/store"
import { analyzeImageColors, generateSmartSuggestions, type SmartSuggestion } from "@/lib/color-analysis"
import { Sparkles, Wand2, Zap, RefreshCw } from "lucide-react"

interface SmartSuggestionsProps {
  imageElement: HTMLImageElement | null
  isVisible: boolean
}

export function SmartSuggestions({ imageElement, isVisible }: SmartSuggestionsProps) {
  const { toast } = useToast()
  const { updateOptions, setOutlineSize, applyPreset } = useImageStore()
  const [suggestions, setSuggestions] = React.useState<SmartSuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = React.useState<string>("")

  // Analyze image when it changes
  React.useEffect(() => {
    if (!imageElement || !isVisible) {
      setSuggestions([])
      return
    }

    const analyzeImage = async () => {
      setIsAnalyzing(true)
      try {
        // Small delay to ensure image is fully loaded
        await new Promise((resolve) => setTimeout(resolve, 100))

        const analysis = await analyzeImageColors(imageElement)
        const smartSuggestions = generateSmartSuggestions(analysis)
        setSuggestions(smartSuggestions)
      } catch (error) {
        console.error("Failed to analyze image:", error)
        toast({
          title: "Analysis failed",
          description: "Couldn't analyze your image, but you can still style it manually.",
          variant: "destructive",
        })
      } finally {
        setIsAnalyzing(false)
      }
    }

    analyzeImage()
  }, [imageElement, isVisible, toast])

  const applySuggestion = (suggestion: SmartSuggestion) => {
    // Apply all settings from the suggestion
    updateOptions({
      theme: suggestion.settings.theme,
      screenshotScale: suggestion.settings.screenshotScale,
      rounded: suggestion.settings.rounded,
      shadow: suggestion.settings.shadow,
      frame: suggestion.settings.frame,
      pattern: suggestion.settings.pattern,
      browserBar: suggestion.settings.browserBar,
    })

    setOutlineSize(suggestion.settings.outlineSize)
    setSelectedSuggestion(suggestion.id)

    toast({
      title: "Style applied!",
      description: `Applied "${suggestion.name}" styling to your screenshot.`,
    })
  }

  const regenerateSuggestions = async () => {
    if (!imageElement) return

    setIsAnalyzing(true)
    setSelectedSuggestion("")

    try {
      const analysis = await analyzeImageColors(imageElement)
      const smartSuggestions = generateSmartSuggestions(analysis)
      setSuggestions(smartSuggestions)

      toast({
        title: "New suggestions generated",
        description: "Fresh styling ideas based on your image.",
      })
    } catch (error) {
      console.error("Failed to regenerate suggestions:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-purple-600" />
          <span className="font-medium text-sm text-stone-800">Smart Suggestions</span>
          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
            AI-Powered
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={regenerateSuggestions}
          disabled={isAnalyzing}
          className="h-7 px-2 text-xs"
        >
          <RefreshCw className={cn("h-3 w-3 mr-1", isAnalyzing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {isAnalyzing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            Analyzing your screenshot...
          </div>
          {/* Loading skeletons */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-stone-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : suggestions.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs text-stone-500">Based on your image's colors and style, here are perfect matches:</p>
          {suggestions.map((suggestion) => (
            <Card
              key={suggestion.id}
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-md border-2",
                selectedSuggestion === suggestion.id
                  ? "border-purple-400 bg-purple-50"
                  : "border-stone-200 hover:border-stone-300",
              )}
              onClick={() => applySuggestion(suggestion)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm text-stone-800">{suggestion.name}</h3>
                    <div className="flex items-center gap-1">
                      {suggestion.confidence > 0.8 && <Sparkles className="h-3 w-3 text-yellow-500" />}
                      {suggestion.confidence > 0.7 && <Zap className="h-3 w-3 text-blue-500" />}
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 mb-2">{suggestion.description}</p>

                  {/* Mini preview */}
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-6 h-4 rounded-sm border border-stone-200",
                        suggestion.settings.theme.includes("bg-gradient") ? suggestion.settings.theme : undefined,
                      )}
                      style={{
                        background: !suggestion.settings.theme.includes("bg-gradient")
                          ? suggestion.settings.theme
                          : undefined,
                      }}
                    />
                    <div className="flex items-center gap-1 text-xs text-stone-500">
                      <span>•</span>
                      <span>
                        {suggestion.settings.frame === "none" ? "No frame" : `${suggestion.settings.frame} frame`}
                      </span>
                      <span>•</span>
                      <span>{suggestion.settings.shadow}x shadow</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      suggestion.confidence > 0.8
                        ? "border-green-300 text-green-700"
                        : suggestion.confidence > 0.6
                          ? "border-blue-300 text-blue-700"
                          : "border-stone-300 text-stone-600",
                    )}
                  >
                    {Math.round(suggestion.confidence * 100)}% match
                  </Badge>
                  {selectedSuggestion === suggestion.id && <div className="w-2 h-2 bg-purple-500 rounded-full" />}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-stone-500">
          <Wand2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Upload an image to get smart styling suggestions</p>
        </div>
      )}
    </div>
  )
}
