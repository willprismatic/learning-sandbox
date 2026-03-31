"use client";

import { useParams } from "next/navigation";
import { getResourceTypeConfig } from "@/lib/resource-config";
import { DynamicForm } from "@/components/dynamic-form";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DynamicFormPage() {
  const params = useParams();
  const type = params.type as string;

  const config = getResourceTypeConfig(type);

  if (!config) {
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
                <BreadcrumbLink href="/forms">Forms</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Unknown</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="mx-auto max-w-2xl w-full">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Unknown Form Type</CardTitle>
                <CardDescription>
                  The form type &quot;{type}&quot; does not exist.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button asChild>
                  <Link href="/forms">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Forms
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    );
  }

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
              <BreadcrumbLink href="/forms">Forms</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{config.displayName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mx-auto max-w-2xl w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">
              {config.displayName} Form
            </h1>
            {config.description && (
              <p className="text-muted-foreground mt-2">
                {config.description}
              </p>
            )}
          </div>

          <Card>
            <CardContent className="pt-6">
              <DynamicForm
                config={config}
                onSuccess={(data) => {
                  // Optional: navigate to the resource detail page or list
                  console.log("Form submitted successfully:", data);
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  );
}
