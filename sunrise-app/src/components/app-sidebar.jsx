'use client'
import * as React from "react"
import { ChevronRight } from "lucide-react"
import Link from "next/link";
import { usePathname } from "next/navigation";


import { SearchForm } from "@/components/search-form"
import { VersionSwitcher } from "@/components/version-switcher"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Home",
      url: "/home",
      items: [],
    },
    {
      title: "Colleges",
      url: "/colleges",
      items: [
        {
          title: "1",
          url: "#",
        },
        {
          title: "2",
          url: "#",
        },
      ],
    },
    {
      title: "Activity Lists",
      url: "#",
      items: [
        {
          title: "1",
          url: "#",
        },
        {
          title: "2",
          url: "#",
        },
      ],
    },
    {
      title: "Scholarships",
      url: "#",
      items: [],
    }
  ],
}

export function AppSidebar({
  ...props
}) {
  const pathname = usePathname();
  return (
    <Sidebar {...props}>
      <SidebarHeader>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        
        {/* We create a collapsible SidebarGroup for each parent. */}
        {data.navMain.map((item) => {
          const hasChildren = item.items.length > 0;

          const isParentActive = item.url !== "#" && pathname.startsWith(item.url);

          return hasChildren ? (
            // --- COLLAPSIBLE ITEM ---
            <Collapsible
              key={item.title}
              title={item.title}
              defaultOpen={false}
              className="group/collapsible"
            >
              <SidebarGroup>
                <SidebarGroupLabel
                  asChild
                  className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
                >
                  <SidebarGroupLabel
                    asChild
                    className={`group/label text-sm flex items-center ${isParentActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}`}
                  >
                    <div className="flex items-center w-full">
                      {/* Main tab is clickable */}
                      <Link href={item.url} className="flex-1">{item.title}</Link>


                      {/* Chevron toggles only the collapse */}
                      <CollapsibleTrigger className="p-1">
                        <ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </CollapsibleTrigger>
                    </div>
                  </SidebarGroupLabel>

                </SidebarGroupLabel>

                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {item.items.map((sub) => {
                        const isSubActive = pathname === sub.url;

                        return (
                          <SidebarMenuItem key={sub.title}>
                            <SidebarMenuButton asChild isActive={sub.isActive}>

                              <Link href={sub.url}>&nbsp;&nbsp;{sub.title}</Link>

                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ) : (
            // --- NON-COLLAPSIBLE ITEM ---
            <SidebarGroup key={item.title}>
              <SidebarGroupLabel
                asChild
                className={`text-sm ${pathname === item.url ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}`}
              >
                <SidebarMenuButton asChild>
                  <Link href={item.url} className="flex-1">{item.title}</Link>
                </SidebarMenuButton>
              </SidebarGroupLabel>
            </SidebarGroup>
          );
        })}

      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
