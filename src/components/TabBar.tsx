"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/discover", label: "Discover", icon: "♥" },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 grid grid-cols-2 border-t border-zinc-200 bg-background">
      {tabs.map((tab) => {
        // "/discover/matches" should still highlight the Discover tab
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 py-3 text-xs font-medium ${
              active ? "text-brand" : "text-zinc-500"
            }`}
          >
            <span className="text-lg leading-none" aria-hidden>
              {tab.icon}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
