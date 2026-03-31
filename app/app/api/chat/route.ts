import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages, stepCountIs } from "ai";
import { experimental_createMCPClient as createMCPClient } from "@ai-sdk/mcp";

// LEARNING: This is where you'd import your integration platform's client
// for token exchange (e.g., exchangeRefreshToken from prismatic-client)
// to authenticate MCP connections with org-level or customer-level tokens.

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    model,
    webSearch,
    mcpServerUrl,
  }: {
    messages: UIMessage[];
    model?: string;
    webSearch?: boolean;
    mcpServerUrl?: string;
  } = await req.json();

  let mcpClient: any;
  let tools: any;

  try {
    // LEARNING: This is where you'd connect to your integration platform's MCP server
    // using authenticated tokens. You'd exchange refresh tokens for access tokens
    // and pass them as Bearer auth headers to the MCP endpoint.
    if (mcpServerUrl) {
      mcpClient = await createMCPClient({
        transport: {
          type: "http",
          url: mcpServerUrl,
        },
      });

      tools = await mcpClient.tools();
    }

    const result = streamText({
      model: webSearch ? openai("gpt-4o") : openai(model || "gpt-4o"),

      messages: convertToModelMessages(messages),
      system: `You are a helpful assistant. ${
        tools
          ? "You have access to integration tools to help with various operations."
          : ""
      }`,
      tools,
      stopWhen: stepCountIs(5),
      onFinish: async () => {
        await mcpClient?.close();
      },
    });

    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });
  } catch (error) {
    console.error("MCP connection error:", error);
    await mcpClient?.close();

    const result = streamText({
      model: openai(model || "gpt-4o"),
      messages: convertToModelMessages(messages),
      system:
        "You are a helpful assistant that can answer questions and help with tasks.",
      stopWhen: stepCountIs(5),
    });

    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });
  }
}
