"use client";

import "./styles/globals.css";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

function LayoutContent({ children }) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Pages where sidebar should NOT appear
  const noSidebarRoutes = ["/", "/signup", "/onboarding"];
  const showSidebar = !noSidebarRoutes.includes(pathname) && user;

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}