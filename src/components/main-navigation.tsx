"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MainNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="메인 메뉴" className="flex gap-3 sm:gap-6">
      {[
        { href: "/", label: "식단표" },
        { href: "/countdown", label: "카운트다운" },
        { href: "/schedule", label: "일정" },
      ].map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
          className={`flex h-16 items-center whitespace-nowrap border-b-2 text-sm font-medium ${pathname === href ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
