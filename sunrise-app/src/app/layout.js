"use client";
import "./styles/globals.css";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const hideSidebarRoutes = ["/login", "/signup"];
  const isAuthRoute = hideSidebarRoutes.includes(pathname);
  
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {isAuthRoute ? (
            <>{children}</>
          ) : (
            // Normal layout with sidebar
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                {children}
              </SidebarInset>
            </SidebarProvider>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}