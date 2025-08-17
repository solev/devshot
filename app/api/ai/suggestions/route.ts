import type { NextRequest } from "next/server"
import { streamObject } from "ai"
import { azure } from "@ai-sdk/azure"
import { getAzureModel } from "@/lib/azure-openai"
import { SuggestionSchema } from "@/lib/schemas"

export async function POST(request: NextRequest) {
  try {
    const { imageData, currentSettings } = await request.json()

    if (!imageData) {
      return Response.json({ error: "Missing imageData" }, { status: 400 })
    }

    // Create Azure OpenAI model
    const model = getAzureModel("gpt-4o-mini")

    // Use AI SDK 5 to stream structured suggestions with vision
    const result = streamObject({
      model: model,
      schema: SuggestionSchema,
      onFinish: (suggestions) => {
        console.log("Suggestions generated:", suggestions)
      },
      messages: [
        {
          role: "system",
          content: `You are an expert UI/UX designer specializing in screenshot beautification. Your task is to analyze screenshots and generate beautiful, professional styling suggestions. 
          Generate 4-6 diverse suggestions that complement the image's style and colors.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this screenshot and create beautiful styling suggestions.

Create suggestions that:
1. Complement the image's color palette
2. Match the UI style (modern, minimal, bold, etc.)
3. Provide variety (minimal to creative)
4. Use appropriate frame styles
5. Include thoughtful pattern overlays when suitable

Each suggestion should have a creative name and clear reasoning.`,
            },
            {
              type: "image",
              image: imageData,
            },
          ],
        },
      ],
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Azure OpenAI streaming suggestions error:", error)
    return Response.json(
      {
        error: "Failed to stream AI suggestions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
