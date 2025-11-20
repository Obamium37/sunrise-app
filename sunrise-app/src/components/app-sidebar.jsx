'use client'
import * as React from "react"
import { ChevronRight, ChevronUp } from "lucide-react"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
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
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Navigation data structure
const data = {
  navMain: [
    {
      title: "Home",
      url: "/home",
      items: [],
    },
    {
      title: "Colleges",
      url: "/colleges",
      items: [],
    },
    {
      title: "Activity Lists",
      url: "/activitylists",
      items: [],
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
  const { user } = useAuth();
  const router = useRouter();
  
  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };
  
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  {user?.email ?? "Account"}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width] bg-white shadow-md border rounded-md"
              >
                <DropdownMenuItem asChild>
                  <Link href="/account" className="block px-3 py-2 cursor-pointer">
                    Account Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="px-3 py-2 cursor-pointer"
                  onClick={handleLogout}
                >
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}