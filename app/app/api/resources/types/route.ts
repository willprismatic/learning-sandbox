import { NextRequest, NextResponse } from 'next/server';
import { getAllResourceTypes } from '@/lib/resource-config';
import { getResourceTypes } from '@/lib/db';

/**
 * GET /api/resources/types
 * Get all available resource type configurations and types currently in the database
 */
export async function GET(request: NextRequest) {
  try {
    // Get all configured resource types
    const configuredTypes = getAllResourceTypes().map(config => ({
      type: config.type,
      displayName: config.displayName,
      displayNamePlural: config.displayNamePlural,
      description: config.description,
      fields: config.fields,
    }));

    // Get resource types that exist in the database
    const dbTypes = getResourceTypes();

    return NextResponse.json({
      success: true,
      data: {
        configured: configuredTypes,
        inDatabase: dbTypes,
      },
    });
  } catch (error) {
    console.error('Error fetching resource types:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
