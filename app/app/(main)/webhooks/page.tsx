"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, Trash2, Eye } from "lucide-react";
import { type WebhookMetadata } from "@/types/webhook";

// LEARNING: This is where you'd import your integration platform's instance/flow
// selector component to auto-populate webhook URLs from deployed integration flows.
// e.g., import { PrismaticInstanceFlowSelector } from "@/components/prismatic-instance-flow-selector";

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


export default function WebhooksPage() {
  const [mounted, setMounted] = useState(false);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [resourceTypes, setResourceTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<{
    url: string;
    events: string[];
    resource_types: string[];
    secret: string;
    enabled: boolean;
    metadata: WebhookMetadata | null;
  }>({
    url: "",
    events: [] as string[],
    resource_types: [] as string[],
    secret: "",
    enabled: true,
    metadata: null,
  });

  // Ensure component only renders on client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchWebhooks();
      fetchResourceTypes();
    }
  }, [mounted]);

  const fetchWebhooks = async () => {
    try {
      const response = await fetch("/api/webhooks");
      const data = await response.json();
      if (data.success) {
        setWebhooks(data.data);
      }
    } catch (error) {
      console.error("Error fetching webhooks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResourceTypes = async () => {
    try {
      const response = await fetch("/api/resources/types");
      const data = await response.json();
      if (data.success) {
        setResourceTypes((data.data.inDatabase || []).map((item: any) => item.type));
      }
    } catch (error) {
      console.error("Error fetching resource types:", error);
    }
  };

  const handleCreateWebhook = async () => {
    try {
      const payload = {
        url: formData.url,
        events: formData.events,
        resource_types:
          formData.resource_types.length > 0 ? formData.resource_types : null,
        secret: formData.secret || null,
        enabled: formData.enabled,
        metadata: formData.metadata,
      };

      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setIsAddDialogOpen(false);
        setFormData({
          url: "",
          events: [],
          resource_types: [],
          secret: "",
          enabled: true,
          metadata: null,
        });
        fetchWebhooks();
      } else {
        alert(`Failed to create webhook: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating webhook:", error);
      alert("Failed to create webhook");
    }
  };

  const handleDeleteWebhook = async (id: number) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;

    try {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchWebhooks();
      } else {
        alert(`Failed to delete webhook: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting webhook:", error);
      alert("Failed to delete webhook");
    }
  };

  const toggleEvent = (event: string) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  const toggleResourceType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      resource_types: prev.resource_types.includes(type)
        ? prev.resource_types.filter((t) => t !== type)
        : [...prev.resource_types, type],
    }));
  };

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Overview</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Webhooks</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
            <p className="text-muted-foreground">
              Manage webhooks to receive notifications when resources are
              created, updated, or deleted
            </p>
          </div>
          {mounted && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Webhook</DialogTitle>
                <DialogDescription>
                  Configure a webhook endpoint to receive notifications about
                  resource changes
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* LEARNING: This is where you'd add a mode selector to toggle between
                    "Integration Platform Flow" (auto-populated from deployed instances)
                    and "Manual URL Entry". The platform mode would use a component like
                    PrismaticInstanceFlowSelector to browse instances and flows. */}

                {/* Webhook URL */}
                <div className="space-y-2">
                  <Label htmlFor="url">Webhook URL *</Label>
                  <Input
                    id="url"
                    placeholder="https://your-app.com/webhook"
                    value={formData.url}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        url: e.target.value,
                        metadata: null,
                      }));
                    }}
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
                          checked={formData.events.includes(event)}
                          onChange={() => toggleEvent(event)}
                          className="rounded"
                        />
                        <span className="text-sm capitalize">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Resource Types */}
                <div className="space-y-2">
                  <Label>Resource Types (leave empty for all types)</Label>
                  <div className="flex flex-wrap gap-2">
                    {resourceTypes && resourceTypes.length > 0 ? (
                      resourceTypes.map((type) => (
                        <label key={type} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.resource_types.includes(type)}
                            onChange={() => toggleResourceType(type)}
                          />
                          {type}
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No resource types available yet. Create a resource first.
                      </p>
                    )}
                  </div>
                </div>

                {/* Secret */}
                <div className="space-y-2">
                  <Label htmlFor="secret">Secret (optional)</Label>
                  <Input
                    id="secret"
                    type="password"
                    placeholder="Optional signing secret"
                    value={formData.secret}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, secret: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Used to sign webhook payloads for verification
                  </p>
                </div>

                {/* Enabled Switch */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, enabled: checked }))
                    }
                  />
                  <Label htmlFor="enabled">Enabled</Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setFormData({
                      url: "",
                      events: [],
                      resource_types: [],
                      secret: "",
                      enabled: true,
                      metadata: null,
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateWebhook}
                  disabled={!formData.url || formData.events.length === 0}
                >
                  Create Webhook
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Webhooks</CardTitle>
            <CardDescription>
              {webhooks.length} webhook{webhooks.length !== 1 ? "s" : ""}{" "}
              configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : webhooks.length === 0 ? (
              <p className="text-muted-foreground">
                No webhooks configured yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Events</TableHead>
                    <TableHead>Resource Types</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell>
                        <div className="flex gap-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="secondary">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {webhook.resource_types ? (
                          <div className="flex gap-1">
                            {webhook.resource_types.map((type) => (
                              <Badge key={type} variant="outline">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            All types
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={webhook.enabled ? "default" : "secondary"}
                        >
                          {webhook.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
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
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/webhooks/${webhook.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
}
