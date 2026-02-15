"use client";

import { useState } from "react";
import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export function SiteShell({
  children,
  hideHeader = false,
}: {
  children: React.ReactNode;
  hideHeader?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileLinks = [
    { href: "/in-memory", label: "In Memory" },
    { href: "/in-love", label: "In Love" },
    { href: "/orders", label: "Orders" },
    { href: "/account", label: "Account" },
  ];

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-20 pt-6 md:px-8">
      {hideHeader ? null : (
        <header className="relative mb-10 flex items-center justify-between gap-3">
          <Link href="/" className="font-serif text-2xl tracking-wide text-stone-800">
            {APP_NAME}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="group inline-flex h-11 items-center gap-2 rounded-full px-3 text-stone-700 transition-colors hover:bg-stone-800/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500/40 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label="Toggle navigation menu"
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 origin-center rounded-full bg-current transition-transform duration-300 ease-out ${
                  menuOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-all duration-200 ease-out ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-[14px] h-0.5 w-5 origin-center rounded-full bg-current transition-transform duration-300 ease-out ${
                  menuOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
            <span className="text-xs font-medium tracking-wide">{menuOpen ? "Close" : "Menu"}</span>
          </button>

          <nav className="hidden gap-6 text-sm text-stone-600 md:flex">
            <Link href="/in-memory">In Memory</Link>
            <Link href="/in-love">In Love</Link>
            <Link href="/orders">Orders</Link>
            <Link href="/account">Account</Link>
          </nav>

          <nav
            id="mobile-nav"
            aria-hidden={!menuOpen}
            className={`absolute left-0 right-0 top-full z-20 mt-3 origin-top overflow-hidden rounded-2xl border border-stone-300/30 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(247,241,235,0.78))] p-2 shadow-[0_14px_45px_rgba(48,43,40,0.14)] backdrop-blur-md transition-all duration-300 ease-out md:hidden ${
              menuOpen
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
            }`}
          >
            <div className="flex flex-col gap-1 text-sm text-stone-800">
              {mobileLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-3 py-2.5 transition-all duration-300 hover:bg-stone-900/5 ${
                    menuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                  }`}
                  style={{
                    transitionDelay: menuOpen ? `${80 + index * 70}ms` : "0ms",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
      )}
      <main className="flex-1">{children}</main>
    </div>
  );
}
