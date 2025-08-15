import { createAzure } from "@ai-sdk/azure";
import { generateText } from "ai";


// Azure OpenAI configuration using AI SDK
const azure = createAzure({
  resourceName: "solev-gpt4", // Azure resource name
  apiKey: "29e323e428e2439f8a195377f3f80ac9", // Azure API key
});

var result = await generateText({
    model: azure("gpt-5-mini"),
    messages: [
        {
            role: "user",
            content: "Hello, how can I assist you today?"
        }
    ]
});

console.log(result.text);