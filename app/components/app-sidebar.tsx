"use client";

import * as React from "react";
import { GalleryVerticalEnd } from "lucide-react";
import { getCompanyName } from "@/lib/app-config";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

// Navigation data
const data = {
  navMain: [
    {
      title: "Application",
      items: [
        {
          title: "Overview",
          url: "/",
        },
        {
          title: "AI Playground",
          url: "/ai-playground",
        },
        {
          title: "Integration Playground",
          url: "/forms",
        },
        {
          title: "Sample Data",
          url: "/resources",
        },
      ],
    },
    // LEARNING: This is where you'd add navigation items for your integration
    // platform's embedded UI screens (e.g., Marketplace, Workflows, Connections, Logs).
    // These pages would render the platform's embedded components via an iframe or SDK.
    {
      title: "Settings",
      items: [
        {
          title: "Webhooks",
          url: "/webhooks",
        },
        // LEARNING: This is where you'd add a link to your integration platform
        // setup page for configuring org credentials, signing keys, and customer context.
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const companyName = getCompanyName();

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">{companyName}</span>
                  <span className="">Sandbox</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((group, groupIndex) => (
              <React.Fragment key={group.title}>
                {groupIndex > 0 && <div className="my-2" />}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <span className="font-medium">{group.title}</span>
                  </SidebarMenuButton>
                  {group.items?.length ? (
                    <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                      {group.items.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={item.url}>{item.title}</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              </React.Fragment>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
