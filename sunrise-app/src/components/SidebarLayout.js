"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarLayout({ children }) {
  const pathname = usePathname();

  const noSidebarRoutes = ["/", "/signup", "/onboarding"];
  const showSidebar = !noSidebarRoutes.includes(pathname);

  return (
    <div style={{ display: "flex" }}>
      {showSidebar && (
        <nav
          style={{
            width: "200px",
            padding: "1rem",
            borderRight: "1px solid #ccc",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><Link href="/home">Home</Link></li>
            <li><Link href="/colleges">Colleges</Link></li>
            <li><Link href="/activitylists">Activity Lists</Link></li>
          </ul>
        </nav>
      )}

      <main style={{ flex: 1, padding: "1rem" }}>
        {children}
      </main>
    </div>
  );
}
