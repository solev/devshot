import { azure } from "@ai-sdk/azure"

// Azure OpenAI configuration using AI SDK
export const azureOpenAI = azure({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
})

// Helper function to check if Azure OpenAI is configured
export function isAzureOpenAIConfigured(): boolean {
  return !!(
    process.env.AZURE_OPENAI_API_KEY &&
    process.env.AZURE_OPENAI_ENDPOINT &&
    process.env.AZURE_OPENAI_DEPLOYMENT_NAME
  )
}

// Get the configured model
export function getAzureModel() {
  if (!isAzureOpenAIConfigured()) {
    throw new Error("Azure OpenAI is not properly configured")
  }

  return azureOpenAI(process.env.AZURE_OPENAI_DEPLOYMENT_NAME!)
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
