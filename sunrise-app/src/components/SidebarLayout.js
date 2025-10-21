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
        <nav className={styles['blocks-container']}>
          <div className={styles['block']}><Link href="/home">Home</Link></div>
          <div className={styles['block']}><Link href="/colleges">Colleges</Link></div>
        </nav>
      )}

      <main>
        {children}
      </main>
    </div>
  );
}
