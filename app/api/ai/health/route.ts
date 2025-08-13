import { NextResponse } from "next/server"
import { isAzureOpenAIConfigured } from "@/lib/azure-openai"

export async function GET() {
  const isConfigured = isAzureOpenAIConfigured()

  return NextResponse.json({
    configured: isConfigured,
    status: isConfigured ? "ready" : "not configured",
    provider: "Azure OpenAI via AI SDK",
    version: "AI SDK v3.4+",
    requiredEnvVars: [
      "AZURE_OPENAI_API_KEY",
      "AZURE_OPENAI_ENDPOINT",
      "AZURE_OPENAI_DEPLOYMENT_NAME",
      "AZURE_OPENAI_API_VERSION",
    ],
    missingVars: [
      !process.env.AZURE_OPENAI_API_KEY && "AZURE_OPENAI_API_KEY",
      !process.env.AZURE_OPENAI_ENDPOINT && "AZURE_OPENAI_ENDPOINT",
      !process.env.AZURE_OPENAI_DEPLOYMENT_NAME && "AZURE_OPENAI_DEPLOYMENT_NAME",
    ].filter(Boolean),
  })
}
