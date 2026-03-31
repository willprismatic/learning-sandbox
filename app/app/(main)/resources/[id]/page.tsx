"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { getResourceTypeConfig } from "@/lib/resource-config";
import { ResourceWebhooksTable } from "@/components/resource-webhooks-table";
import { EditResourceDialog } from "@/components/edit-resource-dialog";
import { Pencil, Trash2 } from "lucide-react";

interface Resource {
  id: number;
  resource_type: string;
  parsedData: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const resourceId = parseInt(id, 10);
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isNaN(resourceId)) {
      notFound();
    }

    async function fetchResource() {
      try {
        const response = await fetch(`/api/resources/${resourceId}`);
        if (!response.ok) {
          notFound();
        }
        const result = await response.json();
        if (result.success) {
          setResource({
            id: result.data.id,
            resource_type: result.data.type,
            parsedData: result.data.data,
            created_at: result.data.createdAt,
            updated_at: result.data.updatedAt,
          });
        }
      } catch (error) {
        console.error("Error fetching resource:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    fetchResource();
  }, [resourceId]);

  // Handler for successful edit
  const handleEditSuccess = () => {
    // Refetch resource data to show updated values
    async function refetchResource() {
      try {
        const response = await fetch(`/api/resources/${resourceId}`);
        if (!response.ok) {
          return;
        }
        const result = await response.json();
        if (result.success) {
          setResource({
            id: result.data.id,
            resource_type: result.data.type,
            parsedData: result.data.data,
            created_at: result.data.createdAt,
            updated_at: result.data.updatedAt,
          });
        }
      } catch (error) {
        console.error("Error refetching resource:", error);
      }
    }
    refetchResource();
  };

  // Handler for delete confirmation
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete resource");
      }

      // Redirect to resources page after successful deletion
      router.push("/resources");
    } catch (error) {
      console.error("Error deleting resource:", error);
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      // Optionally show error message to user
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

  if (!resource) {
    notFound();
  }

  const resourceConfig = getResourceTypeConfig(resource.resource_type);
  const displayName = resourceConfig?.displayName || resource.resource_type;

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
                <Link href="/resources">Sample Data</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {displayName} #{resourceId}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Resource Details */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="flex flex-col h-full p-4 overflow-y-auto">
              {/* Header */}
              <div className="flex flex-col gap-2 mb-4">
                <h1 className="text-3xl font-bold tracking-tight">
                  {displayName} #{resourceId}
                </h1>
                <p className="text-muted-foreground">
                  {resourceConfig?.description ||
                    `Sample ${displayName.toLowerCase()} data for integration testing`}
                </p>
              </div>

              {/* Combined Resource Data Card */}
              <Card className="mx-auto max-w-4xl w-full">
                <CardHeader>
                  <CardTitle>Sample Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sample Data Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Fields
                    </h4>
                    <dl className="grid gap-3">
                      {resourceConfig?.fields.map((field) => {
                        const value = resource.parsedData[field.name];
                        return (
                          <div
                            key={field.name}
                            className="grid grid-cols-3 gap-4"
                          >
                            <dt className="font-medium text-muted-foreground">
                              {field.label}
                            </dt>
                            <dd className="col-span-2">
                              {value !== undefined && value !== null
                                ? String(value)
                                : "-"}
                            </dd>
                          </div>
                        );
                      })}

                      {/* Show any additional fields not in the config */}
                      {Object.entries(resource.parsedData).map(
                        ([key, value]) => {
                          const isConfiguredField = resourceConfig?.fields.some(
                            (f) => f.name === key,
                          );
                          if (isConfiguredField) return null;

                          return (
                            <div key={key} className="grid grid-cols-3 gap-4">
                              <dt className="font-medium text-muted-foreground">
                                {key}
                              </dt>
                              <dd className="col-span-2">
                                {value !== undefined && value !== null
                                  ? String(value)
                                  : "-"}
                              </dd>
                            </div>
                          );
                        },
                      )}
                    </dl>
                  </div>

                  <Separator />

                  {/* Metadata Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Metadata
                    </h4>
                    <dl className="grid gap-3">
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">
                          ID
                        </dt>
                        <dd className="col-span-2">{resource.id}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">
                          Event Type
                        </dt>
                        <dd className="col-span-2">{resource.resource_type}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">
                          Created At
                        </dt>
                        <dd className="col-span-2">
                          {new Date(resource.created_at).toLocaleString()}
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">
                          Updated At
                        </dt>
                        <dd className="col-span-2">
                          {new Date(resource.updated_at).toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Webhook Testing */}
          <ResizablePanel defaultSize={40} minSize={20} maxSize={60}>
            <div className="flex flex-col h-full border-l overflow-y-auto">
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">Webhook Testing</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Test webhook endpoints subscribed to {displayName} events
                </p>
              </div>

              <div className="px-4 pb-4">
                <div className="space-y-3">
                  <ResourceWebhooksTable
                    resourceType={resource.resource_type}
                    events={["updated", "deleted"]}
                    showNoWebhooksMessage={true}
                    className="border rounded-lg"
                    showAddButton={true}
                    defaultEvents={["updated", "deleted"]}
                  />
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Edit Dialog */}
      {resourceConfig && (
        <EditResourceDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          config={resourceConfig}
          resourceId={resourceId}
          currentData={resource.parsedData}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {displayName} #{resourceId}. This
              action cannot be undone and will trigger any webhooks subscribed
              to &quot;deleted&quot; events.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarInset>
  );
}
