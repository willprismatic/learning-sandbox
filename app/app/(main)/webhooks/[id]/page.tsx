"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
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
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { WebhookDeliveriesTable } from "@/components/webhook-deliveries-table";
import { type WebhookMetadata } from "@/types/webhook";

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

export default function WebhookDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const webhookId = parseInt(id, 10);
  const [webhook, setWebhook] = useState<Webhook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isNaN(webhookId)) {
      notFound();
    }

    async function fetchWebhook() {
      try {
        const response = await fetch(`/api/webhooks/${webhookId}`);
        if (!response.ok) {
          notFound();
        }
        const result = await response.json();
        if (result.success) {
          setWebhook(result.data);
        }
      } catch (error) {
        console.error("Error fetching webhook:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    fetchWebhook();
  }, [webhookId]);

  const handleToggleEnabled = async (enabled: boolean) => {
    if (!webhook) return;

    try {
      const response = await fetch(`/api/webhooks/${webhook.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        // Optimistically update the UI
        setWebhook((prev) => (prev ? { ...prev, enabled } : null));
      } else {
        alert("Failed to update webhook");
        // Revert would require refetching
      }
    } catch (error) {
      console.error("Error updating webhook:", error);
      alert("Failed to update webhook");
    }
  };

  if (loading) {
    return (
      <SidebarInset>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </SidebarInset>
    );
  }

  if (!webhook) {
    notFound();
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link href="/">Overview</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link href="/webhooks">Webhooks</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Webhook #{webhookId}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Webhook Configuration */}
          <ResizablePanel defaultSize={45} minSize={30}>
            <div className="flex flex-col h-full p-4 overflow-y-auto">
              {/* Header */}
              <div className="flex flex-col gap-2 mb-4">
                <h1 className="text-3xl font-bold tracking-tight">
                  Webhook #{webhookId}
                </h1>
                <p className="text-muted-foreground">
                  Webhook endpoint configuration and delivery status
                </p>
              </div>

              {/* Configuration Card */}
              <Card className="mx-auto max-w-4xl w-full">
                <CardHeader>
                  <CardTitle>Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Configuration Details */}
                  <div className="space-y-4">
                    <dl className="grid gap-3">
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">
                          Endpoint URL
                        </dt>
                        <dd className="col-span-2 break-all font-mono text-sm">
                          {webhook.url}
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">
                          Events
                        </dt>
                        <dd className="col-span-2">
                          <div className="flex flex-wrap gap-2">
                            {webhook.events.map((event) => (
                              <Badge key={event} variant="secondary">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">
                          Resource Types
                        </dt>
                        <dd className="col-span-2">
                          <div className="flex flex-wrap gap-2">
                            {webhook.resource_types ? (
                              webhook.resource_types.map((type) => (
                                <Badge key={type} variant="outline">
                                  {type}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline">All resource types</Badge>
                            )}
                          </div>
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">
                          Signature
                        </dt>
                        <dd className="col-span-2">
                          {webhook.secret ? (
                            <Badge variant="default">Enabled (HMAC-SHA256)</Badge>
                          ) : (
                            <Badge variant="secondary">Not configured</Badge>
                          )}
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">
                          Status
                        </dt>
                        <dd className="col-span-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              id="enabled"
                              checked={webhook.enabled}
                              onCheckedChange={handleToggleEnabled}
                            />
                            <Label htmlFor="enabled" className="cursor-pointer">
                              {webhook.enabled ? (
                                <Badge variant="default">Enabled</Badge>
                              ) : (
                                <Badge variant="secondary">Disabled</Badge>
                              )}
                            </Label>
                          </div>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* LEARNING: This is where you'd show integration platform metadata
                      (instance ID, flow key, customer info, integration name) for
                      webhooks that are linked to deployed integration instances. */}

                  <Separator />

                  {/* Metadata Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Metadata
                    </h4>
                    <dl className="grid gap-3">
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">ID</dt>
                        <dd className="col-span-2">{webhook.id}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">
                          Created At
                        </dt>
                        <dd className="col-span-2">
                          {new Date(webhook.created_at).toLocaleString()}
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">
                          Updated At
                        </dt>
                        <dd className="col-span-2">
                          {new Date(webhook.updated_at).toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Delivery Logs */}
          <ResizablePanel defaultSize={55} minSize={30}>
            <div className="flex flex-col h-full border-l overflow-y-auto">
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">
                  Delivery Logs
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Recent webhook delivery attempts and their responses
                </p>
              </div>

              <div className="px-4 pb-4">
                <div className="border rounded-lg">
                  <WebhookDeliveriesTable
                    webhookId={webhookId}
                    maxDeliveries={50}
                    showDetails={true}
                  />
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </SidebarInset>
  );
}
