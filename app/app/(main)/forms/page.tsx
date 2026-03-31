"use client";

import { useState, useEffect } from "react";
import { getAllResourceTypes } from "@/lib/resource-config";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DynamicForm } from "@/components/dynamic-form";
import { WebhookDeliveriesTable } from "@/components/webhook-deliveries-table";
import { ResourceWebhooksTable } from "@/components/resource-webhooks-table";

export default function FormsPlaygroundPage() {
  const resourceTypes = getAllResourceTypes();
  const [selectedResourceType, setSelectedResourceType] = useState(
    resourceTypes[0]?.type || "invoice",
  );
  const [isMounted, setIsMounted] = useState(false);
  const [deliveriesTableKey, setDeliveriesTableKey] = useState(0);

  const selectedResource = resourceTypes.find(
    (r) => r.type === selectedResourceType,
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
              <BreadcrumbPage>Integration Playground</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex-1 overflow-hidden">
        {!isMounted ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Form Preview */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="flex flex-col h-full p-4 overflow-y-auto">
                <div className="flex flex-col gap-2 mb-4">
                  <h1 className="text-3xl font-bold tracking-tight">
                    Integration Playground
                  </h1>
                  <p className="text-muted-foreground">
                    Simulate events and test outbound integrations with third-party systems
                  </p>
                </div>

                {selectedResource && (
                  <Card className="mx-auto max-w-4xl w-full">
                    <CardHeader>
                      <CardTitle>{selectedResource.displayName}</CardTitle>
                      {selectedResource.description && (
                        <CardDescription>
                          {selectedResource.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <DynamicForm
                        config={selectedResource}
                        onSuccess={() => setDeliveriesTableKey((prev) => prev + 1)}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel - Configuration & Recent Submissions */}
            <ResizablePanel defaultSize={50} minSize={20} maxSize={70}>
              <div className="flex flex-col h-full border-l">
                <ResizablePanelGroup direction="vertical">
                  {/* Top Section - Configuration */}
                  <ResizablePanel defaultSize={40} minSize={20}>
                    <div className="flex flex-col h-full">
                      <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold mb-2">
                          Configuration
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Select event type and configure webhook endpoints
                        </p>
                      </div>
                      <div className="p-4 space-y-4 overflow-y-auto">
                        <div className="space-y-2">
                          <Label htmlFor="event-type">Event Type</Label>
                          <Select
                            value={selectedResourceType}
                            onValueChange={setSelectedResourceType}
                          >
                            <SelectTrigger id="event-type">
                              <SelectValue placeholder="Select an event type" />
                            </SelectTrigger>
                            <SelectContent>
                              {resourceTypes.map((resource) => (
                                <SelectItem
                                  key={resource.type}
                                  value={resource.type}
                                >
                                  {resource.displayName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Select the type of event to simulate
                          </p>
                        </div>

                        <div className="space-y-3">
                          <ResourceWebhooksTable
                            resourceType={selectedResourceType}
                            events={["created"]}
                            showNoWebhooksMessage={true}
                            className="border rounded-lg"
                            showAddButton={true}
                            onWebhookAdded={() => setDeliveriesTableKey((prev) => prev + 1)}
                            defaultEvents={["created"]}
                          />
                        </div>
                      </div>
                    </div>
                  </ResizablePanel>

                  <ResizableHandle withHandle />

                  {/* Bottom Section - Webhook Deliveries */}
                  <ResizablePanel defaultSize={60} minSize={30}>
                    <div className="flex flex-col h-full">
                      <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold mb-2">
                          Recent Webhook Deliveries
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Recent deliveries for {selectedResource?.displayName || "this resource type"}
                        </p>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <div className="p-4">
                          <div className="border rounded-lg">
                            <WebhookDeliveriesTable
                              key={deliveriesTableKey}
                              resourceType={selectedResourceType}
                              maxDeliveries={10}
                              showDetails={true}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </SidebarInset>
  );
}
