"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
} from "@/components/ai-elements/tool";

// LEARNING: This is where you'd import your integration platform's context and
// instances panel for connecting AI chat to integration flows via MCP.
// e.g., import { PrismaticInstancesPanel } from "@/components/prismatic-instances-panel";
// e.g., import { usePrismatic } from "@/contexts/prismatic-context";

export default function AIPlaygroundPage() {
  const [text, setText] = useState("");
  const [mcpServerUrl, setMcpServerUrl] = useState("");

  // LEARNING: This is where you'd use your integration platform's context to get
  // authentication tokens and connection status for the MCP server.

  const { messages, sendMessage } = useChat({});

  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text?.trim()) {
      sendMessage(
        { text: message.text },
        {
          body: {
            mcpServerUrl: mcpServerUrl || undefined,
          },
        }
      );
      setText("");
    }
  };

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Overview</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>AI Playground</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col h-full p-4">
          <div className="flex flex-col gap-2 mb-4 shrink-0">
            <h1 className="text-3xl font-bold tracking-tight">
              AI Playground
            </h1>
            <p className="text-muted-foreground">
              Test AI chat with tool use capabilities
            </p>
          </div>

          {/* MCP Server URL config */}
          <div className="mb-4 space-y-2">
            <Label htmlFor="mcp-url">MCP Server URL (optional)</Label>
            <Input
              id="mcp-url"
              value={mcpServerUrl}
              onChange={(e) => setMcpServerUrl(e.target.value)}
              placeholder="https://your-mcp-server.com/mcp"
            />
            <p className="text-xs text-muted-foreground">
              {/* LEARNING: This is where you'd configure OAuth for third-party
                  MCP connections (e.g., Prismatic MCP endpoint) with auth mode
                  selectors for org-level vs customer-level tokens. */}
              Enter an MCP server endpoint to enable tool use in the chat.
            </p>
          </div>

          <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <Conversation className="flex-1">
              <ConversationContent>
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Start a conversation by sending a message below
                  </div>
                )}
                {messages.map((message) => (
                  <Message key={message.id} from={message.role}>
                    <MessageContent>
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          return (
                            <MessageResponse key={index}>
                              {part.text}
                            </MessageResponse>
                          );
                        }

                        if (
                          part.type.startsWith("tool-") ||
                          part.type === "dynamic-tool"
                        ) {
                          const toolPart = part as any;
                          return (
                            <Tool key={toolPart.toolCallId || index}>
                              <ToolHeader
                                title={toolPart.title || toolPart.toolName}
                                type={toolPart.type}
                                state={toolPart.state}
                              />
                              <ToolContent>
                                {toolPart.input && (
                                  <ToolInput input={toolPart.input} />
                                )}
                              </ToolContent>
                            </Tool>
                          );
                        }

                        return null;
                      })}
                    </MessageContent>
                  </Message>
                ))}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            <div className="border-t p-4 shrink-0">
              <PromptInput onSubmit={handleSubmit}>
                <PromptInputBody>
                  <PromptInputTextarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your message..."
                  />
                </PromptInputBody>
                <PromptInputFooter>
                  <PromptInputSubmit />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </Card>
        </div>
      </div>
    </SidebarInset>
  );
}
