/**
 * Webhook Metadata Types
 * Defines the structure for flexible webhook metadata
 */

// LEARNING: This is where you'd define metadata types for your integration platform.
// For example, a PrismaticMetadata interface would store instanceId, customerId,
// flowStableKey, and integrationName so webhooks can be linked to specific
// integration instances and flows.

export interface WebhookMetadata {
  /** Optional: Custom tags for categorization */
  tags?: string[];
  /** Optional: Human-readable description */
  description?: string;
  /** Allow additional custom fields */
  [key: string]: unknown;
}
