import { NextRequest, NextResponse } from "next/server";
import {
  getWebhookById,
  updateWebhook,
  deleteWebhook,
  getWebhookDeliveries,
  type WebhookInput,
  type Webhook,
} from "@/lib/db";
import { z } from "zod";

// Validation schema for webhook update
const webhookUpdateSchema = z.object({
  url: z.string().url("Must be a valid URL").optional(),
  events: z
    .array(z.enum(["created", "updated", "deleted"]))
    .min(1, "At least one event is required")
    .optional(),
  resource_types: z.array(z.string()).nullish(),
  secret: z.string().nullish(),
  enabled: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).nullish(),
});

/**
 * GET /api/webhooks/[id]
 * Get a single webhook by ID with its delivery logs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const webhookId = parseInt(id, 10);

    if (isNaN(webhookId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid webhook ID",
        },
        { status: 400 },
      );
    }

    const webhook = getWebhookById(webhookId);

    if (!webhook) {
      return NextResponse.json(
        {
          success: false,
          error: "Webhook not found",
        },
        { status: 404 },
      );
    }

    // Get delivery logs for this webhook
    const deliveries = getWebhookDeliveries({ webhookId, limit: 50 });

    // Parse JSON fields
    const parsedWebhook = {
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
      deliveries: deliveries.map((d) => ({
        id: d.id,
        event: d.event,
        resource_id: d.resource_id,
        resource_type: d.resource_type,
        payload: JSON.parse(d.payload),
        status_code: d.status_code,
        success: d.success === 1,
        error_message: d.error_message,
        response_body: d.response_body,
        created_at: d.created_at,
      })),
    };

    return NextResponse.json({
      success: true,
      data: parsedWebhook,
    });
  } catch (err) {
    console.error("Error fetching webhook:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch webhook",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/webhooks/[id]
 * Update a webhook
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const webhookId = parseInt(id, 10);

    if (isNaN(webhookId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid webhook ID",
        },
        { status: 400 },
      );
    }

    // Check if webhook exists
    const existingWebhook = getWebhookById(webhookId);
    if (!existingWebhook) {
      return NextResponse.json(
        {
          success: false,
          error: "Webhook not found",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    // Validate the request body
    const validatedData = webhookUpdateSchema.parse(body);

    // Update the webhook
    const webhookInput: Partial<WebhookInput> = {};
    if (validatedData.url !== undefined) webhookInput.url = validatedData.url;
    if (validatedData.events !== undefined)
      webhookInput.events = validatedData.events;
    if (validatedData.resource_types !== undefined)
      webhookInput.resource_types = validatedData.resource_types;
    if (validatedData.secret !== undefined)
      webhookInput.secret = validatedData.secret;
    if (validatedData.enabled !== undefined)
      webhookInput.enabled = validatedData.enabled;
    if (validatedData.metadata !== undefined)
      webhookInput.metadata = validatedData.metadata;

    const success = updateWebhook(webhookId, webhookInput);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update webhook",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Webhook updated successfully",
    });
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

    console.error("Error updating webhook:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update webhook",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/webhooks/[id]
 * Delete a webhook
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const webhookId = parseInt(id, 10);

    if (isNaN(webhookId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid webhook ID",
        },
        { status: 400 },
      );
    }

    const success = deleteWebhook(webhookId);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Webhook not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Webhook deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting webhook:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete webhook",
      },
      { status: 500 },
    );
  }
}
