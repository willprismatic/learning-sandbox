"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Info } from "lucide-react";

interface ResourceItem {
  id: number;
  type: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

function ResourcesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 25,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [resourceType, setResourceType] = useState(
    searchParams.get("type") || "",
  );

  useEffect(() => {
    fetchResources();
  }, [searchParams]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const page = searchParams.get("page") || "1";
      const search = searchParams.get("search") || "";
      const type = searchParams.get("type") || "";

      const params = new URLSearchParams();
      params.set("page", page);
      params.set("pageSize", "25");
      if (search) params.set("search", search);
      if (type) params.set("type", type);

      const response = await fetch(`/api/resources?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setResources(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (resourceType) params.set("type", resourceType);
    params.set("page", "1");

    router.push(`/resources?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchTerm("");
    const params = new URLSearchParams();
    if (resourceType) params.set("type", resourceType);
    router.push(`/resources?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    if (searchTerm) params.set("search", searchTerm);
    if (resourceType) params.set("type", resourceType);

    router.push(`/resources?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const displayResourceType = resourceType
    ? `${resourceType} Sample Data`
    : "Sample Data";

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
            <BreadcrumbItem>
              <BreadcrumbPage>Sample Data</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{displayResourceType}</h1>
          <div className="flex gap-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search sample data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-64"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Sample data for testing and demonstrating integrations.</strong>
            <br />
            Resources are created via Integration Playground forms (outbound events) or by
            integrations via API endpoints (inbound operations). All create/update/delete
            operations trigger configured webhooks.
          </AlertDescription>
        </Alert>

        {searchTerm && (
          <p className="text-sm text-muted-foreground">
            Found {pagination.total} result{pagination.total !== 1 ? "s" : ""}{" "}
            for "{searchTerm}"
          </p>
        )}

        <Card>
          {loading ? (
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading...
            </CardContent>
          ) : resources.length === 0 ? (
            <CardContent className="p-8 text-center text-muted-foreground">
              No sample data found.
            </CardContent>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Data Preview</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>{resource.id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{resource.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md truncate text-sm">
                        {Object.entries(resource.data)
                          .slice(0, 2)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="link" asChild>
                        <Link href={`/resources/${resource.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </SidebarInset>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense fallback={
      <SidebarInset>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </SidebarInset>
    }>
      <ResourcesPageContent />
    </Suspense>
  );
}
