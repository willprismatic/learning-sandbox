import { NextRequest, NextResponse } from 'next/server';
import { getResourceById, updateResource, deleteResource } from '@/lib/db';
import { validateResourceData } from '@/lib/resource-config';
import { triggerWebhooks } from '@/lib/webhooks';
import { ZodError } from 'zod';

/**
 * GET /api/resources/[id]
 * Get a single resource by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resourceId = parseInt(id, 10);

    if (isNaN(resourceId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid resource ID',
        },
        { status: 400 }
      );
    }

    const resource = getResourceById(resourceId);

    if (!resource) {
      return NextResponse.json(
        {
          success: false,
          message: 'Resource not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: resource.id,
        type: resource.resource_type,
        data: resource.parsedData,
        createdAt: resource.created_at,
        updatedAt: resource.updated_at,
      },
    });
  } catch (err) {
    console.error('Error fetching resource:', err);
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
 * PUT /api/resources/[id]
 * Update a resource by ID
 * Body: Updated resource data (validated against resource type schema)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resourceId = parseInt(id, 10);

    if (isNaN(resourceId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid resource ID',
        },
        { status: 400 }
      );
    }

    // Get existing resource to determine type
    const existingResource = getResourceById(resourceId);

    if (!existingResource) {
      return NextResponse.json(
        {
          success: false,
          message: 'Resource not found',
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate request body against resource type schema
    const validation = validateResourceData(existingResource.resource_type, body);

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

    // Update in database
    const success = updateResource(resourceId, validation.data);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to update resource',
        },
        { status: 500 }
      );
    }

    // Get updated resource
    const updatedResource = getResourceById(resourceId);

    if (updatedResource) {
      // Trigger webhooks asynchronously (don't wait for completion)
      triggerWebhooks('updated', {
        id: updatedResource.id,
        type: updatedResource.resource_type,
        data: updatedResource.parsedData,
        created_at: updatedResource.created_at,
        updated_at: updatedResource.updated_at,
      }).catch((error) => {
        console.error('Error triggering webhooks:', error);
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedResource!.id,
        type: updatedResource!.resource_type,
        data: updatedResource!.parsedData,
        createdAt: updatedResource!.created_at,
        updatedAt: updatedResource!.updated_at,
      },
      message: 'Resource updated successfully',
    });
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

    console.error('Error updating resource:', err);
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
 * DELETE /api/resources/[id]
 * Delete a resource by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resourceId = parseInt(id, 10);

    if (isNaN(resourceId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid resource ID',
        },
        { status: 400 }
      );
    }

    // Get resource data before deleting (for webhook payload)
    const resourceToDelete = getResourceById(resourceId);

    if (!resourceToDelete) {
      return NextResponse.json(
        {
          success: false,
          message: 'Resource not found',
        },
        { status: 404 }
      );
    }

    const success = deleteResource(resourceId);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to delete resource',
        },
        { status: 500 }
      );
    }

    // Trigger webhooks asynchronously (don't wait for completion)
    triggerWebhooks('deleted', {
      id: resourceToDelete.id,
      type: resourceToDelete.resource_type,
      data: resourceToDelete.parsedData,
      created_at: resourceToDelete.created_at,
      updated_at: resourceToDelete.updated_at,
    }).catch((error) => {
      console.error('Error triggering webhooks:', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting resource:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
