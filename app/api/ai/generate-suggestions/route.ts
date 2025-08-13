import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { getAzureModel, isAzureOpenAIConfigured } from "@/lib/azure-openai"

export async function POST(request: NextRequest) {
  try {
    if (!isAzureOpenAIConfigured()) {
      return NextResponse.json({ error: "Azure OpenAI is not configured" }, { status: 500 })
    }

    const { imageAnalysis, userPreferences } = await request.json()

    const prompt = `
Based on this image analysis: ${JSON.stringify(imageAnalysis)}
And user preferences: ${JSON.stringify(userPreferences)}

Generate 4 styling suggestions for a screenshot mockup. Each suggestion should include:
- backgroundColor (hex color or CSS gradient like "bg-gradient-to-br from-blue-400 to-purple-500")
- frameStyle (none, arc, or stack)
- shadowLevel (0-4)
- borderRadius (0-32)
- reasoning (why this style works)
- confidence (0-1)

Return as valid JSON array with this exact structure:
[
  {
    "backgroundColor": "string",
    "frameStyle": "none|arc|stack",
    "shadowLevel": number,
    "borderRadius": number,
    "reasoning": "string",
    "confidence": number
  }
]
`

    const { text, usage } = await generateText({
      model: getAzureModel(),
      system:
        "You are an expert designer. Generate styling suggestions as valid JSON only, no additional text or markdown formatting.",
      prompt,
      maxTokens: 1500,
      temperature: 0.8,
    })

    // Parse the JSON response
    let suggestions
    try {
      suggestions = JSON.parse(text)
    } catch (parseError) {
      console.error("Failed to parse AI response:", text)
      throw new Error("AI returned invalid JSON")
    }

    return NextResponse.json({
      suggestions,
      usage,
    })
  } catch (error) {
    console.error("Azure OpenAI suggestions error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate AI suggestions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
