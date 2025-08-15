import { createAzure } from "@ai-sdk/azure"

// Azure OpenAI configuration using AI SDK
const azure = createAzure({
  resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME, // Azure resource name
  apiKey: process.env.AZURE_OPENAI_API_KEY, // Azure API key
});

// Helper function to check if Azure OpenAI is configured
export function isAzureOpenAIConfigured(): boolean {
  return !!(
    process.env.AZURE_OPENAI_API_KEY &&
    process.env.AZURE_OPENAI_RESOURCE_NAME
  )
}

// Get the configured model
export function getAzureModel(modelName: string) {
  if (!isAzureOpenAIConfigured()) {
    throw new Error("Azure OpenAI is not properly configured")
  }

  return azure(modelName);
}

// Types for AI responses
export interface AIAnalysisResponse {
  suggestions: string[]
  reasoning: string
  confidence: number
}

export interface AIStyleRecommendation {
  backgroundColor: string
  frameStyle: "none" | "arc" | "stack"
  shadowLevel: number
  borderRadius: number
  reasoning: string
}
