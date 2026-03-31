import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'submissions.db');
const db = new Database(dbPath);

// Initialize database schema
function initDatabase() {
  const createTable = `
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_data TEXT NOT NULL,
      resource_type TEXT NOT NULL DEFAULT 'invoice',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.exec(createTable);

  // Add resource_type column if it doesn't exist (migration for existing databases)
  try {
    db.exec(`ALTER TABLE submissions ADD COLUMN resource_type TEXT NOT NULL DEFAULT 'invoice'`);
  } catch (error) {
    // Column already exists, ignore error
  }

  // Create indexes for performance
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_resource_type ON submissions(resource_type)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_created_at ON submissions(created_at DESC)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_resource_type_created ON submissions(resource_type, created_at DESC)`);
  } catch (error) {
    console.error('Error creating indexes:', error);
  }

  // Create webhooks table
  const createWebhooksTable = `
    CREATE TABLE IF NOT EXISTS webhooks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      events TEXT NOT NULL,
      resource_types TEXT,
      secret TEXT,
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.exec(createWebhooksTable);

  // Create webhook_deliveries table for logging
  const createWebhookDeliveriesTable = `
    CREATE TABLE IF NOT EXISTS webhook_deliveries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      webhook_id INTEGER NOT NULL,
      event TEXT NOT NULL,
      resource_id INTEGER NOT NULL,
      resource_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      status_code INTEGER,
      success INTEGER NOT NULL DEFAULT 0,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
    )
  `;
  db.exec(createWebhookDeliveriesTable);

  // Create indexes for webhook_deliveries
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON webhook_deliveries(created_at DESC)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_success ON webhook_deliveries(success, created_at DESC)`);
  } catch (error) {
    console.error('Error creating webhook_deliveries indexes:', error);
  }

  // Add response_body column if it doesn't exist (migration for existing databases)
  try {
    db.exec(`ALTER TABLE webhook_deliveries ADD COLUMN response_body TEXT`);
  } catch (error) {
    // Column already exists, ignore error
  }

  // Add metadata column to webhooks table if it doesn't exist (migration for existing databases)
  try {
    db.exec(`ALTER TABLE webhooks ADD COLUMN metadata TEXT`);
  } catch (error) {
    // Column already exists, ignore error
  }
}

// Initialize on module load
initDatabase();

export interface Resource {
  id: number;
  form_data: string;
  resource_type: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceData {
  [key: string]: unknown;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  resourceType?: string;
}

export interface PaginatedResult<T = ResourceData> {
  data: Array<Resource & { parsedData: T }>;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

/**
 * Create a new resource
 */
export function createResource(resourceData: ResourceData, resourceType: string): number {
  const stmt = db.prepare(
    'INSERT INTO submissions (form_data, resource_type) VALUES (?, ?)'
  );

  const result = stmt.run(JSON.stringify(resourceData), resourceType);
  return result.lastInsertRowid as number;
}

/**
 * Get all resources with optional filtering, pagination, and search
 */
export function getAllResources(params?: PaginationParams): PaginatedResult {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 25;
  const search = params?.search?.trim();
  const resourceType = params?.resourceType;

  // Build WHERE clause
  const whereClauses: string[] = [];
  const queryParams: (string | number)[] = [];

  if (resourceType) {
    whereClauses.push('resource_type = ?');
    queryParams.push(resourceType);
  }

  if (search) {
    // Search across all fields in the JSON data
    whereClauses.push('form_data LIKE ?');
    queryParams.push(`%${search}%`);
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Get total count
  const countQuery = `SELECT COUNT(*) as count FROM submissions ${whereClause}`;
  const countStmt = db.prepare(countQuery);
  const countResult = (queryParams.length > 0 ? countStmt.get(...queryParams) : countStmt.get()) as { count: number };
  const total = countResult.count;

  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;

  // Get paginated data
  const dataQuery = `
    SELECT * FROM submissions
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  const dataStmt = db.prepare(dataQuery);
  const rows = (queryParams.length > 0
    ? dataStmt.all(...queryParams, pageSize, offset)
    : dataStmt.all(pageSize, offset)
  ) as Resource[];

  return {
    data: rows.map(row => ({
      ...row,
      parsedData: JSON.parse(row.form_data) as ResourceData
    })),
    pagination: {
      total,
      totalPages,
      currentPage: page,
      pageSize,
    }
  };
}

/**
 * Get a single resource by ID
 */
export function getResourceById(id: number): (Resource & { parsedData: ResourceData }) | null {
  const stmt = db.prepare('SELECT * FROM submissions WHERE id = ?');
  const row = stmt.get(id) as Resource | undefined;

  if (!row) return null;

  return {
    ...row,
    parsedData: JSON.parse(row.form_data) as ResourceData
  };
}

/**
 * Update a resource by ID
 */
export function updateResource(id: number, resourceData: ResourceData): boolean {
  const stmt = db.prepare(
    'UPDATE submissions SET form_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  const result = stmt.run(JSON.stringify(resourceData), id);
  return result.changes > 0;
}

/**
 * Delete a resource by ID
 */
export function deleteResource(id: number): boolean {
  const stmt = db.prepare('DELETE FROM submissions WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

/**
 * Get all unique resource types in the database with counts
 */
export function getResourceTypes(): Array<{ type: string; count: number }> {
  const stmt = db.prepare('SELECT resource_type AS type, COUNT(*) AS count FROM submissions GROUP BY resource_type ORDER BY resource_type');
  return stmt.all() as Array<{ type: string; count: number }>;
}

// ========== WEBHOOK FUNCTIONS ==========

export interface Webhook {
  id: number;
  url: string;
  events: string; // JSON array of event types: ["created", "updated", "deleted"]
  resource_types: string | null; // JSON array of resource types, null = all types
  secret: string | null;
  enabled: number; // 0 or 1 (SQLite boolean)
  metadata: string | null; // JSON object with flexible metadata structure
  created_at: string;
  updated_at: string;
}

export interface WebhookInput {
  url: string;
  events: string[]; // ["created", "updated", "deleted"]
  resource_types?: string[] | null; // null or undefined = all resource types
  secret?: string | null;
  enabled?: boolean;
  metadata?: Record<string, unknown> | null; // Flexible JSON metadata
}

export interface WebhookDelivery {
  id: number;
  webhook_id: number;
  event: string;
  resource_id: number;
  resource_type: string;
  payload: string;
  status_code: number | null;
  success: number; // 0 or 1 (SQLite boolean)
  error_message: string | null;
  response_body: string | null;
  created_at: string;
}

/**
 * Create a new webhook
 */
export function createWebhook(input: WebhookInput): number {
  const stmt = db.prepare(`
    INSERT INTO webhooks (url, events, resource_types, secret, enabled, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    input.url,
    JSON.stringify(input.events),
    input.resource_types ? JSON.stringify(input.resource_types) : null,
    input.secret || null,
    input.enabled !== false ? 1 : 0,
    input.metadata ? JSON.stringify(input.metadata) : null
  );

  return result.lastInsertRowid as number;
}

/**
 * Get all webhooks with optional filtering by resource type
 */
export function getAllWebhooks(params?: { resourceType?: string }): Webhook[] {
  const stmt = db.prepare('SELECT * FROM webhooks ORDER BY created_at DESC');
  const webhooks = stmt.all() as Webhook[];

  // If no resource type filter, return all webhooks
  if (!params?.resourceType) {
    return webhooks;
  }

  // Filter webhooks that match the resource type
  return webhooks.filter(webhook => {
    // If resource_types is null, webhook applies to all resource types
    if (!webhook.resource_types) return true;

    // Check if the specified resource type is in the webhook's resource_types array
    const resourceTypes = JSON.parse(webhook.resource_types) as string[];
    return resourceTypes.includes(params.resourceType!);
  });
}

/**
 * Get a single webhook by ID
 */
export function getWebhookById(id: number): Webhook | null {
  const stmt = db.prepare('SELECT * FROM webhooks WHERE id = ?');
  const row = stmt.get(id) as Webhook | undefined;
  return row || null;
}

/**
 * Update a webhook
 */
export function updateWebhook(id: number, input: Partial<WebhookInput>): boolean {
  const updates: string[] = [];
  const values: unknown[] = [];

  if (input.url !== undefined) {
    updates.push('url = ?');
    values.push(input.url);
  }
  if (input.events !== undefined) {
    updates.push('events = ?');
    values.push(JSON.stringify(input.events));
  }
  if (input.resource_types !== undefined) {
    updates.push('resource_types = ?');
    values.push(input.resource_types ? JSON.stringify(input.resource_types) : null);
  }
  if (input.secret !== undefined) {
    updates.push('secret = ?');
    values.push(input.secret || null);
  }
  if (input.enabled !== undefined) {
    updates.push('enabled = ?');
    values.push(input.enabled ? 1 : 0);
  }
  if (input.metadata !== undefined) {
    updates.push('metadata = ?');
    values.push(input.metadata ? JSON.stringify(input.metadata) : null);
  }

  if (updates.length === 0) return false;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const stmt = db.prepare(`UPDATE webhooks SET ${updates.join(', ')} WHERE id = ?`);
  const result = stmt.run(...values);
  return result.changes > 0;
}

/**
 * Delete a webhook
 */
export function deleteWebhook(id: number): boolean {
  const stmt = db.prepare('DELETE FROM webhooks WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

/**
 * Get active webhooks that should be triggered for a given event and resource type
 */
export function getActiveWebhooksForEvent(event: string, resourceType: string): Webhook[] {
  const stmt = db.prepare(`
    SELECT * FROM webhooks
    WHERE enabled = 1
  `);

  const webhooks = stmt.all() as Webhook[];

  // Filter webhooks that match the event and resource type
  return webhooks.filter(webhook => {
    // Check if event is in the webhook's events array
    const events = JSON.parse(webhook.events) as string[];
    if (!events.includes(event)) return false;

    // Check if resource type matches (null = all types)
    if (webhook.resource_types) {
      const resourceTypes = JSON.parse(webhook.resource_types) as string[];
      if (!resourceTypes.includes(resourceType)) return false;
    }

    return true;
  });
}

/**
 * Log a webhook delivery attempt
 */
export function logWebhookDelivery(delivery: Omit<WebhookDelivery, 'id' | 'created_at'>): number {
  const stmt = db.prepare(`
    INSERT INTO webhook_deliveries (
      webhook_id, event, resource_id, resource_type, payload,
      status_code, success, error_message, response_body
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    delivery.webhook_id,
    delivery.event,
    delivery.resource_id,
    delivery.resource_type,
    delivery.payload,
    delivery.status_code || null,
    delivery.success,
    delivery.error_message || null,
    delivery.response_body || null
  );

  return result.lastInsertRowid as number;
}

/**
 * Get webhook delivery logs with optional filtering
 */
export function getWebhookDeliveries(params?: {
  webhookId?: number;
  resourceType?: string;
  limit?: number;
  offset?: number;
}): WebhookDelivery[] {
  const limit = params?.limit || 50;
  const offset = params?.offset || 0;

  let query = 'SELECT * FROM webhook_deliveries';
  const queryParams: (number | string)[] = [];
  const whereClauses: string[] = [];

  if (params?.webhookId) {
    whereClauses.push('webhook_id = ?');
    queryParams.push(params.webhookId);
  }

  if (params?.resourceType) {
    whereClauses.push('resource_type = ?');
    queryParams.push(params.resourceType);
  }

  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  queryParams.push(limit, offset);

  const stmt = db.prepare(query);
  return stmt.all(...queryParams) as WebhookDelivery[];
}

export default db;
