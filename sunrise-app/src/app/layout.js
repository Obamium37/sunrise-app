"use client";
import "./styles/globals.css";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Archivo_Black, Space_Grotesk } from "next/font/google";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-head",
  display: "swap",
});
 
const space = Space_Grotesk({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sans",
  display: "swap",
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const hideSidebarRoutes = ["/login", "/signup"];
  const isAuthRoute = hideSidebarRoutes.includes(pathname);
  
  return (
    <html lang="en">
      <body className={`${archivoBlack.variable} ${space.variable}`}>
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