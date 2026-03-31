"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Trash2, Plus } from "lucide-react";
import { type WebhookMetadata } from "@/types/webhook";

// LEARNING: This is where you'd import your integration platform's instance/flow
// selector component for auto-populating webhook URLs from deployed integration flows.

interface Webhook {
  id: number;
  url: string;
  events: string[];
  resource_types: string[] | null;
  secret: string | null;
  enabled: boolean;
  metadata: WebhookMetadata | null;
  created_at: string;
  updated_at: string;
}

interface ResourceWebhooksTableProps {
  resourceType: string;
  events: string[];
  showNoWebhooksMessage?: boolean;
  className?: string;
  showAddButton?: boolean;
  onWebhookAdded?: () => void;
  defaultEvents?: string[];
}

export function ResourceWebhooksTable({
  resourceType,
  events,
  showNoWebhooksMessage = true,
  className,
  showAddButton = false,
  onWebhookAdded,
  defaultEvents,
}: ResourceWebhooksTableProps) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);

  // Add webhook dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState<{
    url: string;
    events: string[];
    secret: string;
    metadata: WebhookMetadata | null;
  }>({
    url: "",
    events: defaultEvents || [],
    secret: "",
    metadata: null,
  });

  const fetchWebhooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/webhooks?resource_type=${resourceType}`
      );
      if (response.ok) {
        const data = await response.json();
        const allWebhooks = data.data || [];

        // Filter webhooks that have at least one matching event
        const filtered = allWebhooks.filter((webhook: Webhook) =>
          webhook.events.some((event) => events.includes(event))
        );

        setWebhooks(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch webhooks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [resourceType, events]);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const handleToggleEnabled = async (webhook: Webhook, enabled: boolean) => {
    try {
      const response = await fetch(`/api/webhooks/${webhook.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        setWebhooks((prev) =>
          prev.map((w) => (w.id === webhook.id ? { ...w, enabled } : w))
        );
      } else {
        alert("Failed to update webhook");
        fetchWebhooks();
      }
    } catch (error) {
      console.error("Error updating webhook:", error);
      alert("Failed to update webhook");
      fetchWebhooks();
    }
  };

  const handleViewWebhook = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setShowViewDialog(true);
  };

  const handleDeleteWebhook = async () => {
    if (!selectedWebhook) return;

    try {
      const response = await fetch(`/api/webhooks/${selectedWebhook.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowDeleteDialog(false);
        setSelectedWebhook(null);
        fetchWebhooks();
      } else {
        alert("Failed to delete webhook");
      }
    } catch (error) {
      console.error("Error deleting webhook:", error);
      alert("Failed to delete webhook");
    }
  };

  // Webhook creation handlers
  const handleCreateWebhook = async () => {
    if (!createForm.url || createForm.events.length === 0) {
      alert("Please enter a URL and select at least one event");
      return;
    }

    try {
      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: createForm.url,
          events: createForm.events,
          resource_types: [resourceType],
          secret: createForm.secret || null,
          enabled: true,
          metadata: createForm.metadata,
        }),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        setCreateForm({
          url: "",
          events: defaultEvents || [],
          secret: "",
          metadata: null,
        });

        fetchWebhooks();

        if (onWebhookAdded) {
          onWebhookAdded();
        }
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create webhook");
      }
    } catch (error) {
      console.error("Error creating webhook:", error);
      alert("Failed to create webhook");
    }
  };

  const handleEventToggle = (event: string) => {
    setCreateForm((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  return (
    <>
      {/* Always render button header when enabled */}
      {showAddButton && (
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium">Subscribed Endpoints</p>
            <p className="text-xs text-muted-foreground mt-1">
              Webhooks that will receive events
            </p>
          </div>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Webhook
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-sm text-muted-foreground py-8 text-center">
          Loading webhooks...
        </div>
      )}

      {/* Empty state */}
      {!isLoading && webhooks.length === 0 && showNoWebhooksMessage && (
        <div className="text-sm text-muted-foreground py-8 text-center border rounded-lg">
          No webhook endpoints configured for this event type.
          <br />
          <Link href="/webhooks" className="text-primary hover:underline mt-2 inline-block">
            Go to Webhooks
          </Link>{" "}
          to add webhooks.
        </div>
      )}

      {/* Table with webhooks */}
      {!isLoading && webhooks.length > 0 && (
        <div className={className}>
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Enabled</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.map((webhook) => (
              <TableRow key={webhook.id}>
                <TableCell>
                  <Switch
                    checked={webhook.enabled}
                    onCheckedChange={(checked) =>
                      handleToggleEnabled(webhook, checked)
                    }
                  />
                </TableCell>
                {/* LEARNING: This is where you'd show integration platform metadata
                    (e.g., integration name, flow key) for webhooks linked to platform instances. */}
                <TableCell className="max-w-xs">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-mono text-xs truncate block cursor-help">
                          {webhook.url}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-sm break-all">{webhook.url}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewWebhook(webhook)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedWebhook(webhook);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      )}

      {/* View Webhook Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Webhook Endpoint Details</DialogTitle>
            <DialogDescription>
              Webhook endpoint configuration
            </DialogDescription>
          </DialogHeader>
          {selectedWebhook && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">URL</p>
                <p className="text-sm break-all">{selectedWebhook.url}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Events</p>
                <div className="flex gap-2 mt-1">
                  {selectedWebhook.events.map((event) => (
                    <Badge key={event} variant="secondary">
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Resource Types
                </p>
                <div className="flex gap-2 mt-1">
                  {selectedWebhook.resource_types ? (
                    selectedWebhook.resource_types.map((type) => (
                      <Badge key={type} variant="outline">
                        {type}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">All resource types</Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <p className="text-sm">
                  {selectedWebhook.enabled ? (
                    <Badge variant="default">Enabled</Badge>
                  ) : (
                    <Badge variant="secondary">Disabled</Badge>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Has Secret
                </p>
                <p className="text-sm">
                  {selectedWebhook.secret ? "Yes" : "No"}
                </p>
              </div>
              {/* LEARNING: This is where you'd show integration platform details
                  (instance ID, flow key, customer info) for linked webhooks. */}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Webhook Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Webhook Endpoint?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this webhook endpoint? This
              action cannot be undone.
            </AlertDialogDescription>
            {selectedWebhook && (
              <div className="mt-2 p-2 bg-muted rounded text-sm break-all">
                {selectedWebhook.url}
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWebhook}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Webhook Dialog */}
      {showAddButton && (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Webhook Endpoint</DialogTitle>
              <DialogDescription>
                Add a webhook endpoint to receive events for this resource type
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* LEARNING: This is where you'd add a mode selector to toggle between
                  "Integration Platform Flow" and "Manual URL Entry" modes. */}

              {/* Webhook URL */}
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL *</Label>
                <Input
                  id="webhook-url"
                  value={createForm.url}
                  onChange={(e) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      url: e.target.value,
                      metadata: null,
                    }));
                  }}
                  placeholder="https://example.com/webhook"
                />
              </div>

              {/* Events Selection */}
              <div className="space-y-2">
                <Label>Events *</Label>
                <div className="flex gap-3">
                  {["created", "updated", "deleted"].map((event) => (
                    <label
                      key={event}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={createForm.events.includes(event)}
                        onChange={() => handleEventToggle(event)}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Secret (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="webhook-secret">Secret (optional)</Label>
                <Input
                  id="webhook-secret"
                  value={createForm.secret}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, secret: e.target.value }))
                  }
                  placeholder="Optional signing secret"
                  type="password"
                />
                <p className="text-xs text-muted-foreground">
                  Used to sign webhook payloads for verification
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setCreateForm({
                    url: "",
                    events: defaultEvents || [],
                    secret: "",
                    metadata: null,
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateWebhook}>Add Webhook</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
