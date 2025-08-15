import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { getAzureModel, isAzureOpenAIConfigured } from "@/lib/azure-openai"

export async function POST(request: NextRequest) {
  try {
    // Check if Azure OpenAI is configured
    if (!isAzureOpenAIConfigured()) {
      return NextResponse.json({ error: "Azure OpenAI is not configured" }, { status: 500 })
    }

    const { imageData, prompt } = await request.json()

    if (!imageData || !prompt) {
      return NextResponse.json({ error: "Missing imageData or prompt" }, { status: 400 })
    }

    // Use AI SDK to generate text with vision
    const { text, usage } = await generateText({
      model: getAzureModel("gpt-5-mini"),
      messages: [
        {
          role: "system",
          content:
            "You are an expert UI/UX designer and color theorist. Analyze screenshots and provide styling recommendations for beautiful mockups.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image",
              image: imageData,
            },
          ],
        },
      ],
      temperature: 0.7,
    })

    return NextResponse.json({
      analysis: text,
      usage,
    })
  } catch (error) {
    console.error("Azure OpenAI API error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze image with AI",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
