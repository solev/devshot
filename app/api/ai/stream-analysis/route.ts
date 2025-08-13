import type { NextRequest } from "next/server"
import { streamText } from "ai"
import { getAzureModel, isAzureOpenAIConfigured } from "@/lib/azure-openai"

export async function POST(request: NextRequest) {
  try {
    if (!isAzureOpenAIConfigured()) {
      return new Response("Azure OpenAI is not configured", { status: 500 })
    }

    const { imageData, prompt } = await request.json()

    if (!imageData || !prompt) {
      return new Response("Missing imageData or prompt", { status: 400 })
    }

    // Use AI SDK to stream text with vision
    const result = await streamText({
      model: getAzureModel(),
      messages: [
        {
          role: "system",
          content:
            "You are an expert UI/UX designer. Analyze screenshots and provide detailed styling recommendations in a conversational, helpful tone.",
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
      maxTokens: 1000,
      temperature: 0.7,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Azure OpenAI streaming error:", error)
    return new Response("Failed to stream AI analysis", { status: 500 })
  }
}
