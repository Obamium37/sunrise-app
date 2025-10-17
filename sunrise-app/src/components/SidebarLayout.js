"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SidebarLayout.module.css";

export default function SidebarLayout({ children }) {
  const pathname = usePathname();

  const noSidebarRoutes = ["/", "/signup", "/onboarding"];
  const showSidebar = !noSidebarRoutes.includes(pathname);

  return (
    <div className={styles['sidebar']}>
      {showSidebar && (
        <nav>
          <ul>
            <li><Link href="/home">Home</Link></li>
            <li><Link href="/colleges">Colleges</Link></li>
          </ul>
        </nav>
      )}

      <main>
        {children}
      </main>
    </div>
  );
}
