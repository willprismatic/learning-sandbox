"use client";

import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FlaskConical,
  Cable,
  Bot,
  Database,
} from "lucide-react";
import { getCompanyName } from "@/lib/app-config";

// LEARNING: This is where you'd import your integration platform's context
// (e.g., usePrismatic) to show setup status badges and links to embedded screens.

const features = [
  {
    title: "Integration Playground",
    href: "/forms",
    description:
      "Simulate real-world events (resource creates/updates) that trigger integration webhooks and watch them fire in real time.",
    icon: FlaskConical,
  },
  {
    title: "Sample Data",
    href: "/resources",
    description:
      "Browse and manage sample resource records used for integration testing.",
    icon: Database,
  },
  {
    title: "Webhooks",
    href: "/webhooks",
    description:
      "Configure webhook endpoints that fire when resources are created, updated, or deleted.",
    icon: Cable,
  },
  // LEARNING: This is where you'd add a card for your embedded integration marketplace,
  // allowing customers to browse and self-activate integrations from your platform.
  {
    title: "AI Playground",
    href: "/ai-playground",
    description:
      "Explore AI-powered chat with tool use capabilities via MCP server connections.",
    icon: Bot,
  },
];

export default function Dashboard() {
  const companyName = getCompanyName();

  // LEARNING: This is where you'd use your integration platform's context to check
  // configuration status and show setup prompts (e.g., isConfigured, orgSetup, customerSetup).

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Overview</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-8 p-4 md:p-6">
        {/* Hero */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {companyName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            A SaaS application with webhook-driven resource management, ready for integration platform implementation.
          </p>
        </div>

        {/* LEARNING: This is where you'd show integration platform setup status
            (e.g., "Prismatic configured" badge with customer name, or a "Set up now" prompt). */}

        {/* Feature cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href} className="group">
              <Card className="h-full transition-colors group-hover:border-foreground/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
                      <feature.icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </SidebarInset>
  );
}
