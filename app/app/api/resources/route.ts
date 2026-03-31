import { NextRequest, NextResponse } from 'next/server';
import { createResource, getAllResources, getResourceById } from '@/lib/db';
import { validateResourceData } from '@/lib/resource-config';
import { triggerWebhooks } from '@/lib/webhooks';
import { ZodError } from 'zod';

/**
 * GET /api/resources
 * Get all resources with optional filtering, pagination, and search
 * Query params:
 *  - type: string (optional) - Filter by resource type
 *  - page: number (default 1)
 *  - pageSize: number (default 25)
 *  - search: string (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const resourceType = searchParams.get('type') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);
    const search = searchParams.get('search') || undefined;

    const result = getAllResources({ page, pageSize, search, resourceType });

    return NextResponse.json({
      success: true,
      data: result.data.map((resource) => ({
        id: resource.id,
        type: resource.resource_type,
        data: resource.parsedData,
        createdAt: resource.created_at,
        updatedAt: resource.updated_at,
      })),
      pagination: result.pagination,
    });
  } catch (err) {
    console.error('Error fetching resources:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/resources
 * Create a new resource
 * Query params:
 *  - type: string (required) - Resource type
 * Body: Resource data (validated against resource type schema)
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const resourceType = searchParams.get('type');

    if (!resourceType) {
      return NextResponse.json(
        {
          success: false,
          message: 'Resource type is required (use ?type=<type> query parameter)',
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body against resource type schema
    const validation = validateResourceData(resourceType, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: validation.error?.issues,
        },
        { status: 400 }
      );
    }

    // Insert into database
    const resourceId = createResource(validation.data, resourceType);

    // Get the newly created resource for webhook payload
    const createdResource = getResourceById(resourceId);

    if (createdResource) {
      // Trigger webhooks asynchronously (don't wait for completion)
      triggerWebhooks('created', {
        id: createdResource.id,
        type: createdResource.resource_type,
        data: createdResource.parsedData,
        created_at: createdResource.created_at,
        updated_at: createdResource.updated_at,
      }).catch((error) => {
        console.error('Error triggering webhooks:', error);
      });
    }

    return NextResponse.json(
      {
        success: true,
        id: resourceId,
        type: resourceType,
        message: 'Resource created successfully',
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: err.issues,
        },
        { status: 400 }
      );
    }

    console.error('Error creating resource:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
