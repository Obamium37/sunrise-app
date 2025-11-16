'use client';

import "./styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
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


    // <html lang="en">
    //   <SidebarProvider>
    //     <AppSidebar />
    //     <SidebarInset>
    //       <body>
    //         <SidebarTrigger />
            
    //         <AuthProvider>{children}</AuthProvider>
    //         <Separator orientation="vertical" className="mr-2 h-4" />
    //         <Breadcrumb>
    //           <BreadcrumbList>
    //             <BreadcrumbItem className="hidden md:block">
    //               <BreadcrumbLink href="#">
    //                 Building Your Application
    //               </BreadcrumbLink>
    //             </BreadcrumbItem>
    //             <BreadcrumbSeparator className="hidden md:block" />
    //             <BreadcrumbItem>
    //               <BreadcrumbPage>Data Fetching</BreadcrumbPage>
    //             </BreadcrumbItem>
    //           </BreadcrumbList>
    //         </Breadcrumb>
            
    //       </body>
    //     </SidebarInset>
    //   </SidebarProvider>
    // </html>
}

