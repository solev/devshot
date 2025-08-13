export interface ColorAnalysis {
  dominantColors: string[]
  brightness: "light" | "dark" | "mixed"
  saturation: "low" | "medium" | "high"
  temperature: "warm" | "cool" | "neutral"
  uiType: "mobile" | "desktop" | "web" | "unknown"
}

export interface SmartSuggestion {
  id: string
  name: string
  description: string
  confidence: number
  settings: {
    theme: string
    screenshotScale: number
    rounded: number
    shadow: number
    frame: "none" | "arc" | "stack"
    pattern: {
      enabled: boolean
      type: "waves" | "dots" | "stripes" | "zigzag" | "graphpaper" | "none"
      intensity: number
      opacity: number
      rotation: number
    }
    browserBar: "hidden" | "light" | "dark"
    outlineSize: number
  }
}

// Extract dominant colors from image
export function analyzeImageColors(imageElement: HTMLImageElement): Promise<ColorAnalysis> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!

    // Scale down for faster analysis
    const maxSize = 100
    const scale = Math.min(maxSize / imageElement.width, maxSize / imageElement.height)
    canvas.width = imageElement.width * scale
    canvas.height = imageElement.height * scale

    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Sample pixels and analyze
    const colorCounts: Record<string, number> = {}
    let totalBrightness = 0
    let totalSaturation = 0
    let warmPixels = 0
    let coolPixels = 0
    let pixelCount = 0

    // Sample every 4th pixel for performance
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      if (a < 128) continue // Skip transparent pixels

      pixelCount++

      // Calculate brightness (0-255)
      const brightness = r * 0.299 + g * 0.587 + b * 0.114
      totalBrightness += brightness

      // Calculate saturation
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const saturation = max === 0 ? 0 : (max - min) / max
      totalSaturation += saturation

      // Determine temperature (warm vs cool)
      if (r > b + 10) warmPixels++
      else if (b > r + 10) coolPixels++

      // Group similar colors
      const colorKey = `${Math.floor(r / 32) * 32},${Math.floor(g / 32) * 32},${Math.floor(b / 32) * 32}`
      colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1
    }

    // Get dominant colors
    const sortedColors = Object.entries(colorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([color]) => `rgb(${color})`)

    // Determine characteristics
    const avgBrightness = totalBrightness / pixelCount
    const avgSaturation = totalSaturation / pixelCount

    const brightness = avgBrightness > 180 ? "light" : avgBrightness < 80 ? "dark" : "mixed"
    const saturation = avgSaturation > 0.6 ? "high" : avgSaturation < 0.3 ? "low" : "medium"
    const temperature = warmPixels > coolPixels * 1.2 ? "warm" : coolPixels > warmPixels * 1.2 ? "cool" : "neutral"

    // Detect UI type based on aspect ratio and colors
    const aspectRatio = imageElement.width / imageElement.height
    let uiType: ColorAnalysis["uiType"] = "unknown"
    if (aspectRatio < 0.8) uiType = "mobile"
    else if (aspectRatio > 1.5) uiType = "desktop"
    else uiType = "web"

    resolve({
      dominantColors: sortedColors,
      brightness,
      saturation,
      temperature,
      uiType,
    })
  })
}

// Generate smart suggestions based on analysis
export function generateSmartSuggestions(analysis: ColorAnalysis): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = []

  // Suggestion 1: Complementary contrast
  if (analysis.brightness === "light") {
    suggestions.push({
      id: "contrast-dark",
      name: "Dark Contrast",
      description: "Dark background to make your light interface pop",
      confidence: 0.9,
      settings: {
        theme: analysis.temperature === "warm" ? "#1f2937" : "#0f172a",
        screenshotScale: 0.85,
        rounded: 12,
        shadow: 3,
        frame: "none",
        pattern: { enabled: false, type: "none", intensity: 15, opacity: 6, rotation: 0 },
        browserBar: "dark",
        outlineSize: 8,
      },
    })
  } else if (analysis.brightness === "dark") {
    suggestions.push({
      id: "contrast-light",
      name: "Clean Light",
      description: "Bright background for your dark interface",
      confidence: 0.9,
      settings: {
        theme: "#ffffff",
        screenshotScale: 0.85,
        rounded: 16,
        shadow: 2,
        frame: "none",
        pattern: { enabled: false, type: "none", intensity: 15, opacity: 6, rotation: 0 },
        browserBar: "light",
        outlineSize: 12,
      },
    })
  }

  // Suggestion 2: Harmonious gradient
  let gradientTheme = "bg-gradient-to-br from-stone-100 to-stone-200"
  if (analysis.temperature === "warm" && analysis.saturation !== "low") {
    gradientTheme = "bg-gradient-to-br from-orange-200 to-rose-300"
  } else if (analysis.temperature === "cool" && analysis.saturation !== "low") {
    gradientTheme = "bg-gradient-to-br from-blue-200 to-indigo-300"
  } else if (analysis.saturation === "high") {
    gradientTheme = "bg-gradient-to-br from-purple-200 to-pink-300"
  }

  suggestions.push({
    id: "harmonious-gradient",
    name: "Harmonious Gradient",
    description: "Subtle gradient that complements your colors",
    confidence: 0.8,
    settings: {
      theme: gradientTheme,
      screenshotScale: 0.9,
      rounded: 20,
      shadow: 2,
      frame: "arc",
      pattern: { enabled: false, type: "none", intensity: 15, opacity: 6, rotation: 0 },
      browserBar: analysis.brightness === "dark" ? "dark" : "light",
      outlineSize: 6,
    },
  })

  // Suggestion 3: Professional minimal
  suggestions.push({
    id: "professional-minimal",
    name: "Professional",
    description: "Clean and minimal for business use",
    confidence: 0.7,
    settings: {
      theme: analysis.brightness === "dark" ? "#f8fafc" : "#1e293b",
      screenshotScale: 0.88,
      rounded: 8,
      shadow: 1,
      frame: "none",
      pattern: { enabled: true, type: "dots", intensity: 40, opacity: 3, rotation: 0 },
      browserBar: analysis.brightness === "dark" ? "light" : "dark",
      outlineSize: 10,
    },
  })

  // Suggestion 4: Creative with pattern
  const patternType = analysis.uiType === "mobile" ? "waves" : "stripes"
  suggestions.push({
    id: "creative-pattern",
    name: "Creative Pop",
    description: "Bold style with subtle pattern overlay",
    confidence: 0.6,
    settings: {
      theme:
        analysis.temperature === "warm"
          ? "bg-gradient-to-br from-amber-300 to-orange-400"
          : "bg-gradient-to-br from-emerald-300 to-teal-400",
      screenshotScale: 0.8,
      rounded: 24,
      shadow: 4,
      frame: "stack",
      pattern: { enabled: true, type: patternType, intensity: 20, opacity: 8, rotation: 45 },
      browserBar: "hidden",
      outlineSize: 4,
    },
  })

  return suggestions.sort((a, b) => b.confidence - a.confidence)
}
