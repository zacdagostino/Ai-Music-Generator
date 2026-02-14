import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-20 pt-6 md:px-8">
      <header className="mb-10 flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl tracking-wide text-stone-800">
          {APP_NAME}
        </Link>
        <nav className="flex gap-6 text-sm text-stone-600">
          <Link href="/in-memory">In Memory</Link>
          <Link href="/in-love">In Love</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/account">Account</Link>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
