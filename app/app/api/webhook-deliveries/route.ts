import { NextRequest, NextResponse } from "next/server";
import { getWebhookDeliveries } from "@/lib/db";

/**
 * GET /api/webhook-deliveries
 * Get webhook deliveries with optional filtering
 * Query params:
 *  - resource_type: Filter deliveries by resource type (required)
 *  - limit: Maximum number of deliveries to return (optional, default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const resourceType = searchParams.get("resource_type");
    const limitParam = searchParams.get("limit");

    // Validate resource_type is provided
    if (!resourceType) {
      return NextResponse.json(
        {
          success: false,
          error: "resource_type query parameter is required",
        },
        { status: 400 },
      );
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    // Validate limit is a positive number
    if (isNaN(limit) || limit <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "limit must be a positive number",
        },
        { status: 400 },
      );
    }

    // Get deliveries filtered by resource type
    const deliveries = getWebhookDeliveries({
      resourceType,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: deliveries,
    });
  } catch (err) {
    console.error("Error fetching webhook deliveries:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch webhook deliveries",
      },
      { status: 500 },
    );
  }
}
