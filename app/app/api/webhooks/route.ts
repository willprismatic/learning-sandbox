import { NextRequest, NextResponse } from "next/server";
import {
  getAllWebhooks,
  createWebhook,
  type WebhookInput,
  type Webhook,
} from "@/lib/db";
import { z } from "zod";

// Validation schema for webhook input
const webhookSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  events: z
    .array(z.enum(["created", "updated", "deleted"]))
    .min(1, "At least one event is required"),
  resource_types: z.array(z.string()).nullish(),
  secret: z.string().nullish(),
  enabled: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).nullish(),
});

/**
 * GET /api/webhooks
 * Get all webhooks with optional resource_type filtering
 * Query params:
 *  - resource_type: Filter webhooks by resource type (e.g., ?resource_type=invoice)
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const resourceType = searchParams.get("resource_type") || undefined;

    // Get webhooks with optional filtering
    const webhooks = getAllWebhooks(
      resourceType ? { resourceType } : undefined,
    );

    // Parse JSON fields for easier consumption
    const parsedWebhooks = webhooks.map((webhook: Webhook) => ({
      id: webhook.id,
      url: webhook.url,
      events: JSON.parse(webhook.events) as string[],
      resource_types: webhook.resource_types
        ? (JSON.parse(webhook.resource_types) as string[])
        : null,
      secret: webhook.secret ? "***" : null, // Don't expose the actual secret
      enabled: webhook.enabled === 1,
      metadata: webhook.metadata ? JSON.parse(webhook.metadata) : null,
      created_at: webhook.created_at,
      updated_at: webhook.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: parsedWebhooks,
    });
  } catch (err) {
    console.error("Error fetching webhooks:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch webhooks",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/webhooks
 * Create a new webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = webhookSchema.parse(body);

    // Create the webhook
    const webhookInput: WebhookInput = {
      url: validatedData.url,
      events: validatedData.events,
      resource_types: validatedData.resource_types || null,
      secret: validatedData.secret || null,
      enabled: validatedData.enabled !== false,
      metadata: validatedData.metadata || null,
    };

    const id = createWebhook(webhookInput);

    return NextResponse.json(
      {
        success: true,
        id,
        message: "Webhook created successfully",
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: err.message,
        },
        { status: 400 },
      );
    }

    console.error("Error creating webhook:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create webhook",
      },
      { status: 500 },
    );
  }
}
