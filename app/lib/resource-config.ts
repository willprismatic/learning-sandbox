import { z } from 'zod';

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
 * Registry of all resource type configurations
 */
export const resourceTypeRegistry: Record<string, ResourceTypeConfig> = {
  invoice: invoiceConfig,
  lead: leadConfig,
  ticket: ticketConfig,
  todo: todoConfig,
};

/**
 * Get resource type configuration
 */
export function getResourceTypeConfig(type: string): ResourceTypeConfig | undefined {
  return resourceTypeRegistry[type];
}

/**
 * Get all available resource types
 */
export function getAllResourceTypes(): ResourceTypeConfig[] {
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
