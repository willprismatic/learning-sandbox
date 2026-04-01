import { z } from 'zod';
import { getActiveResourceTypeSlug } from './app-config';

/**
 * Resource field definition
 */
export interface ResourceField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: z.ZodType<any>;
}

/**
 * Resource type configuration
 */
export interface ResourceTypeConfig {
  type: string;
  displayName: string;
  displayNamePlural: string;
  icon?: string;
  description?: string;
  fields: ResourceField[];
  schema: z.ZodObject<any>;
}

/**
 * Invoice resource type
 */
export const invoiceConfig: ResourceTypeConfig = {
  type: 'invoice',
  displayName: 'Invoice',
  displayNamePlural: 'Invoices',
  description: 'Invoice records',
  fields: [
    {
      name: 'invoiceNumber',
      label: 'Invoice Number',
      type: 'text',
      required: true,
    },
    {
      name: 'customerName',
      label: 'Customer Name',
      type: 'text',
      required: true,
    },
    {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      required: true,
    },
    {
      name: 'dueDate',
      label: 'Due Date',
      type: 'date',
      required: true,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'paid', label: 'Paid' },
        { value: 'overdue', label: 'Overdue' },
      ],
    },
  ],
  schema: z.object({
    invoiceNumber: z.string().min(1, 'Invoice number is required'),
    customerName: z.string().min(1, 'Customer name is required'),
    amount: z.number().positive('Amount must be positive'),
    dueDate: z.string().min(1, 'Due date is required'),
    status: z.enum(['draft', 'sent', 'paid', 'overdue']),
  }),
};

/**
 * Example: Lead resource type
 */
export const leadConfig: ResourceTypeConfig = {
  type: 'lead',
  displayName: 'Lead',
  displayNamePlural: 'Leads',
  description: 'AcmeCorp lead records',
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
    },
    {
      name: 'company',
      label: 'Company',
      type: 'text',
      required: false,
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      required: false,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'new', label: 'New' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'qualified', label: 'Qualified' },
        { value: 'converted', label: 'Converted' },
      ],
    },
  ],
  schema: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    company: z.string().optional(),
    phone: z.string().optional(),
    status: z.enum(['new', 'contacted', 'qualified', 'converted']),
  }),
};

/**
 * Ticket resource type (Canny feature requests)
 */
export const ticketConfig: ResourceTypeConfig = {
  type: 'ticket',
  displayName: 'Ticket',
  displayNamePlural: 'Tickets',
  description: 'Feature requests and feedback (Canny)',
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'open', label: 'Open' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'planned', label: 'Planned' },
        { value: 'completed', label: 'Completed' },
        { value: 'closed', label: 'Closed' },
      ],
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      required: false,
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'critical', label: 'Critical' },
      ],
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: false,
      options: [
        { value: 'bug', label: 'Bug' },
        { value: 'feature', label: 'Feature Request' },
        { value: 'improvement', label: 'Improvement' },
        { value: 'question', label: 'Question' },
      ],
    },
    {
      name: 'assignee',
      label: 'Assignee',
      type: 'text',
      required: false,
    },
    {
      name: 'reporter',
      label: 'Reporter',
      type: 'text',
      required: false,
    },
  ],
  schema: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    status: z.enum(['open', 'in-progress', 'planned', 'completed', 'closed']),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    category: z.enum(['bug', 'feature', 'improvement', 'question']).optional(),
    assignee: z.string().optional(),
    reporter: z.string().optional(),
  }),
};

/**
 * Example: Todo resource type (for Acme)
 */
export const todoConfig: ResourceTypeConfig = {
  type: 'todo',
  displayName: 'Todo',
  displayNamePlural: 'Todos',
  description: 'Todo items',
  fields: [
    {
      name: 'task',
      label: 'Task',
      type: 'text',
      required: true,
    },
    {
      name: 'completed',
      label: 'Completed',
      type: 'select',
      required: false,
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
    },
  ],
  schema: z.object({
    task: z.string().min(1, 'Task is required'),
    completed: z.preprocess(
      (val) => val === 'true' || val === true,
      z.boolean()
    ).default(false),
  }),
};

/**
 * Customer resource type (Vaultline — QuickBooks)
 */
export const customerConfig: ResourceTypeConfig = {
  type: 'customer',
  displayName: 'Customer',
  displayNamePlural: 'Customers',
  description: 'Customer and account records',
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'company', label: 'Company', type: 'text', required: false },
    { name: 'phone', label: 'Phone', type: 'text', required: false },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'prospect', label: 'Prospect' },
      ],
    },
  ],
  schema: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    company: z.string().optional(),
    phone: z.string().optional(),
    status: z.enum(['active', 'inactive', 'prospect']),
  }),
};

/**
 * Shipment resource type (ShipHawk — Slack)
 */
export const shipmentConfig: ResourceTypeConfig = {
  type: 'shipment',
  displayName: 'Shipment',
  displayNamePlural: 'Shipments',
  description: 'Shipment tracking records',
  fields: [
    { name: 'trackingNumber', label: 'Tracking Number', type: 'text', required: true },
    { name: 'origin', label: 'Origin', type: 'text', required: true },
    { name: 'destination', label: 'Destination', type: 'text', required: true },
    { name: 'carrier', label: 'Carrier', type: 'text', required: false },
    { name: 'estimatedDelivery', label: 'Estimated Delivery', type: 'date', required: false },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'in-transit', label: 'In Transit' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'returned', label: 'Returned' },
      ],
    },
  ],
  schema: z.object({
    trackingNumber: z.string().min(1, 'Tracking number is required'),
    origin: z.string().min(1, 'Origin is required'),
    destination: z.string().min(1, 'Destination is required'),
    carrier: z.string().optional(),
    estimatedDelivery: z.string().optional(),
    status: z.enum(['pending', 'in-transit', 'delivered', 'returned']),
  }),
};

/**
 * Project resource type (PlanSync — Jira)
 */
export const projectConfig: ResourceTypeConfig = {
  type: 'project',
  displayName: 'Project',
  displayNamePlural: 'Projects',
  description: 'Project management records',
  fields: [
    { name: 'name', label: 'Project Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: false },
    { name: 'assignee', label: 'Assignee', type: 'text', required: false },
    { name: 'dueDate', label: 'Due Date', type: 'date', required: false },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      required: false,
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'planning', label: 'Planning' },
        { value: 'active', label: 'Active' },
        { value: 'on-hold', label: 'On Hold' },
        { value: 'completed', label: 'Completed' },
      ],
    },
  ],
  schema: z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().optional(),
    assignee: z.string().optional(),
    dueDate: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    status: z.enum(['planning', 'active', 'on-hold', 'completed']),
  }),
};

/**
 * Patient resource type (MedBridge — Salesforce)
 */
export const patientConfig: ResourceTypeConfig = {
  type: 'patient',
  displayName: 'Patient',
  displayNamePlural: 'Patients',
  description: 'Patient records',
  fields: [
    { name: 'name', label: 'Patient Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: false },
    { name: 'phone', label: 'Phone', type: 'text', required: false },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
    { name: 'provider', label: 'Provider', type: 'text', required: false },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'discharged', label: 'Discharged' },
      ],
    },
  ],
  schema: z.object({
    name: z.string().min(1, 'Patient name is required'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().optional(),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    provider: z.string().optional(),
    status: z.enum(['active', 'inactive', 'discharged']),
  }),
};

/**
 * Marketing Event resource type (DataPulse — Salesforce)
 */
export const marketingEventConfig: ResourceTypeConfig = {
  type: 'marketing-event',
  displayName: 'Marketing Event',
  displayNamePlural: 'Marketing Events',
  description: 'Marketing event records',
  fields: [
    { name: 'name', label: 'Event Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: false },
    { name: 'date', label: 'Event Date', type: 'date', required: true },
    { name: 'attendees', label: 'Expected Attendees', type: 'number', required: false },
    {
      name: 'type',
      label: 'Event Type',
      type: 'select',
      required: true,
      options: [
        { value: 'webinar', label: 'Webinar' },
        { value: 'conference', label: 'Conference' },
        { value: 'email-campaign', label: 'Email Campaign' },
        { value: 'social', label: 'Social Media' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'planned', label: 'Planned' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
  ],
  schema: z.object({
    name: z.string().min(1, 'Event name is required'),
    description: z.string().optional(),
    date: z.string().min(1, 'Event date is required'),
    attendees: z.number().nonnegative().optional(),
    type: z.enum(['webinar', 'conference', 'email-campaign', 'social']),
    status: z.enum(['planned', 'active', 'completed', 'cancelled']),
  }),
};

/**
 * Campaign resource type (CloudVault — Mailchimp)
 */
export const campaignConfig: ResourceTypeConfig = {
  type: 'campaign',
  displayName: 'Campaign',
  displayNamePlural: 'Campaigns',
  description: 'Email campaign records',
  fields: [
    { name: 'name', label: 'Campaign Name', type: 'text', required: true },
    { name: 'subject', label: 'Subject Line', type: 'text', required: false },
    { name: 'sendDate', label: 'Send Date', type: 'date', required: false },
    { name: 'recipientCount', label: 'Recipient Count', type: 'number', required: false },
    {
      name: 'type',
      label: 'Campaign Type',
      type: 'select',
      required: true,
      options: [
        { value: 'regular', label: 'Regular' },
        { value: 'automated', label: 'Automated' },
        { value: 'ab-test', label: 'A/B Test' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'sending', label: 'Sending' },
        { value: 'sent', label: 'Sent' },
        { value: 'archived', label: 'Archived' },
      ],
    },
  ],
  schema: z.object({
    name: z.string().min(1, 'Campaign name is required'),
    subject: z.string().optional(),
    sendDate: z.string().optional(),
    recipientCount: z.number().nonnegative().optional(),
    type: z.enum(['regular', 'automated', 'ab-test']),
    status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'archived']),
  }),
};

/**
 * Registry of all resource type configurations
 */
export const resourceTypeRegistry: Record<string, ResourceTypeConfig> = {
  invoice: invoiceConfig,
  lead: leadConfig,
  ticket: ticketConfig,
  todo: todoConfig,
  customer: customerConfig,
  shipment: shipmentConfig,
  project: projectConfig,
  patient: patientConfig,
  'marketing-event': marketingEventConfig,
  campaign: campaignConfig,
};

/**
 * Get resource type configuration
 */
export function getResourceTypeConfig(type: string): ResourceTypeConfig | undefined {
  return resourceTypeRegistry[type];
}

/**
 * Get available resource types, filtered by NEXT_PUBLIC_RESOURCE_TYPE if set.
 * When the env var is set, only that single type is returned.
 * When unset, all registered types are returned.
 */
export function getAllResourceTypes(): ResourceTypeConfig[] {
  const activeSlug = getActiveResourceTypeSlug();
  if (activeSlug) {
    const config = resourceTypeRegistry[activeSlug];
    return config ? [config] : Object.values(resourceTypeRegistry);
  }
  return Object.values(resourceTypeRegistry);
}

/**
 * Validate resource data against its type schema
 */
export function validateResourceData(type: string, data: any): { success: boolean; data?: any; error?: z.ZodError } {
  const config = getResourceTypeConfig(type);

  if (!config) {
    return {
      success: false,
      error: new z.ZodError([{
        code: 'custom',
        message: `Unknown resource type: ${type}`,
        path: ['resourceType'],
      }]),
    };
  }

  try {
    const validated = config.schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Register a new resource type configuration
 */
export function registerResourceType(config: ResourceTypeConfig): void {
  resourceTypeRegistry[config.type] = config;
}
