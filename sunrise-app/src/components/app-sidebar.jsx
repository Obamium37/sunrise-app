'use client'
import * as React from "react"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

import HomeIcon from "./icons/HomeIcon";
import CapIcon from "./icons/CapIcon";
import ListIcon from "./icons/ListIcon";
import BagIcon from "./icons/BagIcon";

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const [showAccountMenu, setShowAccountMenu] = React.useState(false)
  
  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  const iconSize = 25;

  const navItems = [
    { title: "🏠 Home", url: "/home", emoji:  <HomeIcon size={iconSize}></HomeIcon>},
    { title: "🎓 Colleges", url: "/colleges", emoji: <CapIcon size={iconSize}></CapIcon> },
    { title: "📋 Activity Lists", url: "/activitylists", emoji: <ListIcon size={iconSize}></ListIcon> },
    { title: "💰 Scholarships", url: "#", emoji: <BagIcon size={iconSize}></BagIcon> },
  ];

  const isActive = (url) => {
    if (url === "#") return false;
    return pathname === url || pathname.startsWith(url);
  };

  return (
    <div className="sticky top-0 h-screen bg-amber-50 border-r-4 border-purple-900 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b-4 border-purple-900">
        <h1 className="text-3xl font-black uppercase text-center">
          SUNRISE
        </h1>
        <p className="text-center text-sm font-bold mt-1">College Planner</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 mt-3 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.url);
          return (
            <Link
              key={item.title}
              href={item.url}
              className={`
                block w-full text-left px-4 py-3 font-bold text-lg
                border-4 border-black
                transition-all
                ${active 
                  ? 'bg-amber-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' 
                  : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-100 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
                }
              `}
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <span>{item.title.split(' ').slice(1).join(' ')}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Account */}
      <div className="p-4">
        <div className="relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="w-full px-4 py-3 font-bold text-left border-4 border-black bg-purple-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👤</span>
                <span className="text-sm truncate">
                  {user?.email?.split('@')[0] || "Account"}
                </span>
              </div>
              <span className="text-md">{showAccountMenu ? ' ▼' : ' ▲'}</span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showAccountMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <Link
                href="/account"
                className="block px-4 py-3 font-bold hover:bg-amber-100 border-b-4 border-black"
                onClick={() => setShowAccountMenu(false)}
              >
                ⚙️ Account Details
              </Link>
              <button
                onClick={() => {
                  setShowAccountMenu(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-3 font-bold hover:bg-amber-100"
              >
                🚪 Log Out
              </button>
            </div>
          )}
        </div>

        {/* User Info
        {user?.email && (
          <div className="mt-3 p-2 bg-gradient-to-r from-purple-200 to-pink-200 border-2 border-black text-xs font-bold text-center">
            {user.email}
          </div>
        )} */}
      </div>
    </div>
  );
}