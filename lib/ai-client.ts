"use client"

// Client-side utilities for AI integration using AI SDK
export interface AIImageAnalysis {
  dominantColors: string[]
  brightness: "light" | "dark" | "mixed"
  uiType: "mobile" | "desktop" | "web"
  complexity: "simple" | "moderate" | "complex"
}

export interface AISuggestion {
  id: string
  name: string
  description: string
  backgroundColor: string
  frameStyle: "none" | "arc" | "stack"
  shadowLevel: number
  borderRadius: number
  confidence: number
  reasoning: string
}

// Analyze image with AI
export async function analyzeImageWithAI(imageDataUrl: string): Promise<string> {
  const response = await fetch("/api/ai/analyze-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageData: imageDataUrl,
      prompt: `Analyze this screenshot image and describe:
1. The dominant colors and color palette
2. Whether it's a light or dark interface
3. The type of UI (mobile app, desktop app, website)
4. The overall complexity and style
5. Any notable design elements or patterns

Provide insights that would help generate beautiful background colors and styling for a mockup.`,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.details || "Failed to analyze image with AI")
  }

  const data = await response.json()
  return data.analysis
}

// Stream AI analysis for real-time feedback
export async function streamImageAnalysis(
  imageDataUrl: string,
  onChunk: (chunk: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: Error) => void,
): Promise<void> {
  try {
    const response = await fetch("/api/ai/stream-analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageData: imageDataUrl,
        prompt: `Analyze this screenshot and provide styling recommendations. Be specific about colors, layout, and design elements that would work well.`,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to start AI analysis stream")
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("No response body")
    }

    const decoder = new TextDecoder()
    let fullText = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      fullText += chunk
      onChunk(chunk)
    }

    onComplete(fullText)
  } catch (error) {
    onError(error instanceof Error ? error : new Error("Unknown streaming error"))
  }
}

// Generate AI-powered styling suggestions
export async function generateAISuggestions(
  imageAnalysis: AIImageAnalysis,
  userPreferences?: any,
): Promise<AISuggestion[]> {
  const response = await fetch("/api/ai/generate-suggestions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageAnalysis,
      userPreferences: userPreferences || {},
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.details || "Failed to generate AI suggestions")
  }

  const data = await response.json()

  // Add IDs and names to suggestions if not present
  return data.suggestions.map((suggestion: any, index: number) => ({
    id: `ai-suggestion-${index}`,
    name: `AI Style ${index + 1}`,
    description: suggestion.reasoning.substring(0, 100) + "...",
    ...suggestion,
  }))
}

// Check if AI features are available
export async function checkAIAvailability(): Promise<boolean> {
  try {
    const response = await fetch("/api/ai/health")

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.configured
  } catch {
    return false
  }
}
