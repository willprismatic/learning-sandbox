import crypto from 'crypto';
import {
  getActiveWebhooksForEvent,
  logWebhookDelivery,
  type Webhook,
  type ResourceData,
} from './db';

export type WebhookEvent = 'created' | 'updated' | 'deleted';

export interface WebhookPayload {
  event: WebhookEvent;
  resource: {
    id: number;
    type: string;
    data: ResourceData;
    created_at: string;
    updated_at: string;
  };
  timestamp: string;
}

/**
 * Generate HMAC signature for webhook payload
 */
function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Deliver a webhook to a single endpoint
 */
async function deliverWebhook(
  webhook: Webhook,
  payload: WebhookPayload
): Promise<{
  success: boolean;
  statusCode?: number;
  errorMessage?: string;
}> {
  const payloadString = JSON.stringify(payload);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'SE-Bootcamp-Webhook/1.0',
    'X-Webhook-Event': payload.event,
    'X-Webhook-Resource-Type': payload.resource.type,
    'X-Webhook-Resource-Id': payload.resource.id.toString(),
    'X-Webhook-Timestamp': payload.timestamp,
  };

  // Add signature if secret is configured
  if (webhook.secret) {
    const signature = generateSignature(payloadString, webhook.secret);
    headers['X-Webhook-Signature'] = `sha256=${signature}`;
  }

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: payloadString,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    const success = response.ok; // 2xx status codes

    // Read the response body
    let responseBody: string | null = null;
    try {
      responseBody = await response.text();
    } catch (err) {
      // If reading response body fails, log the error but don't fail the delivery
      console.error('Failed to read response body:', err);
    }

    // Log the delivery attempt
    logWebhookDelivery({
      webhook_id: webhook.id,
      event: payload.event,
      resource_id: payload.resource.id,
      resource_type: payload.resource.type,
      payload: payloadString,
      status_code: response.status,
      success: success ? 1 : 0,
      error_message: success ? null : `HTTP ${response.status}: ${response.statusText}`,
      response_body: responseBody,
    });

    return {
      success,
      statusCode: response.status,
      errorMessage: success ? undefined : `HTTP ${response.status}: ${response.statusText}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Log the failed delivery
    logWebhookDelivery({
      webhook_id: webhook.id,
      event: payload.event,
      resource_id: payload.resource.id,
      resource_type: payload.resource.type,
      payload: payloadString,
      status_code: null,
      success: 0,
      error_message: errorMessage,
      response_body: null,
    });

    return {
      success: false,
      errorMessage,
    };
  }
}

/**
 * Trigger webhooks for a resource event
 *
 * This function finds all active webhooks configured for the given event and resource type,
 * then delivers the webhook payload to each endpoint.
 *
 * @param event - The event type (created, updated, deleted)
 * @param resource - The resource data
 * @returns Summary of delivery results
 */
export async function triggerWebhooks(
  event: WebhookEvent,
  resource: {
    id: number;
    type: string;
    data: ResourceData;
    created_at: string;
    updated_at: string;
  }
): Promise<{
  triggered: number;
  successful: number;
  failed: number;
}> {
  // Get all active webhooks for this event and resource type
  const webhooks = getActiveWebhooksForEvent(event, resource.type);

  if (webhooks.length === 0) {
    return { triggered: 0, successful: 0, failed: 0 };
  }

  // Build the webhook payload
  const payload: WebhookPayload = {
    event,
    resource,
    timestamp: new Date().toISOString(),
  };

  // Deliver to all webhooks (in parallel for performance)
  const results = await Promise.all(
    webhooks.map(webhook => deliverWebhook(webhook, payload))
  );

  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;

  return {
    triggered: webhooks.length,
    successful,
    failed,
  };
}

/**
 * Verify webhook signature
 *
 * Use this function when receiving webhooks to verify they came from your app
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!signature.startsWith('sha256=')) {
    return false;
  }

  const expectedSignature = generateSignature(payload, secret);
  const receivedSignature = signature.slice(7); // Remove 'sha256=' prefix

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(receivedSignature)
  );
}
