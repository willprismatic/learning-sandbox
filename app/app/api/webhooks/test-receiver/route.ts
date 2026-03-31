import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/webhooks';

/**
 * POST /api/webhooks/test-receiver
 * A test endpoint to receive and log webhook deliveries for local testing
 *
 * This endpoint can be used to test webhook configuration locally.
 * It logs all received webhooks and returns a 200 OK response.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const payload = JSON.parse(body);

    // Get webhook headers
    const headers = {
      signature: request.headers.get('X-Webhook-Signature'),
      event: request.headers.get('X-Webhook-Event'),
      resourceType: request.headers.get('X-Webhook-Resource-Type'),
      resourceId: request.headers.get('X-Webhook-Resource-Id'),
      timestamp: request.headers.get('X-Webhook-Timestamp'),
    };

    console.log('=== Webhook Received ===');
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Payload:', JSON.stringify(payload, null, 2));

    // If a secret is provided in the query params, verify the signature
    const secret = request.nextUrl.searchParams.get('secret');
    if (secret && headers.signature) {
      const isValid = verifyWebhookSignature(body, headers.signature, secret);
      console.log('Signature Valid:', isValid);

      if (!isValid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid webhook signature',
          },
          { status: 401 }
        );
      }
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Webhook received and logged',
      received: {
        event: payload.event,
        resource: {
          id: payload.resource?.id,
          type: payload.resource?.type,
        },
        timestamp: payload.timestamp,
      },
    });
  } catch (error) {
    console.error('Error processing test webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process webhook',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/test-receiver
 * Returns information about how to use this test endpoint
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return NextResponse.json({
    name: 'Webhook Test Receiver',
    description: 'Use this endpoint to test webhook deliveries locally',
    usage: {
      url: `${baseUrl}/api/webhooks/test-receiver`,
      method: 'POST',
      optional_query_params: {
        secret: 'Your webhook secret for signature verification',
      },
    },
    example_commands: {
      '1. Create a test webhook': `curl -X POST ${baseUrl}/api/webhooks \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "${baseUrl}/api/webhooks/test-receiver",
    "events": ["created", "updated", "deleted"],
    "resource_types": null,
    "secret": "test-secret-123",
    "enabled": true
  }'`,
      '2. Create a resource to trigger the webhook': `curl -X POST '${baseUrl}/api/resources?type=invoice' \\
  -H "Content-Type: application/json" \\
  -d '{ "invoiceNumber": "INV-001", "customerName": "Test Customer", "amount": "1000.00", "dueDate": "2024-12-31" }'`,
      '3. Check server console': 'Look for "=== Webhook Received ===" in your terminal logs',
    },
    note: 'All webhook deliveries to this endpoint will be logged to the server console',
  });
}
