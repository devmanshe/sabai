"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RequireRole } from "@/components/Protected";
import { useApp } from "@/lib/store";

const adminLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Support", href: "/admin/support" }
];

const superAdminLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Users", href: "/admin/users" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Settings", href: "/admin/settings" }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
  }, [searchParams]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) {
      params.set("q", search.trim());
    } else {
      params.delete("q");
    }
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const isSuperAdmin = user?.role === "superadmin";
  const links = isSuperAdmin ? superAdminLinks : adminLinks;
  const title = isSuperAdmin ? "Super Admin Control" : "Admin Control";
  const subtitle = isSuperAdmin
    ? "Full system management and business strategy"
    : "Order handling and customer support";

  const initials = (user?.name || "Admin")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <RequireRole roles={["admin", "superadmin"]}>
      <div className="min-h-screen bg-[#eff2f8] p-3 md:p-4">
        <div className="mx-auto grid max-w-[1500px] gap-4 lg:grid-cols-[240px_1fr]">
          <button
            type="button"
            className="btn-ghost w-fit lg:hidden"
            onClick={() => setDrawerOpen((prev) => !prev)}
          >
            {drawerOpen ? "Close Menu" : "Open Menu"}
          </button>

          <aside
            className={`rounded-3xl bg-gradient-to-b from-[#315790] via-[#2b4e84] to-[#1f3f72] p-4 text-white shadow-lift ${
              drawerOpen ? "block" : "hidden lg:flex"
            } lg:min-h-[calc(100vh-32px)] lg:flex-col`}
          >
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-sm font-bold">
                  {initials || "AD"}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">{user?.name || "Admin"}</p>
                  <p className="text-xs text-white/80">{isSuperAdmin ? "Super Admin" : "Admin"}</p>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-white/75">{subtitle}</p>
            </div>

            <nav className="mt-4 space-y-1.5">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      active
                        ? "bg-white text-[#2b4e84] shadow-soft"
                        : "text-white/85 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${active ? "bg-[#2b4e84]" : "bg-white/40"}`} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-6">
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Logout
              </button>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="rounded-3xl border border-[#dfe6f1] bg-white px-4 py-3 shadow-soft">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-lg font-semibold text-[#2f4f75]">E-Commerce Dashboard</h1>
                  <p className="text-xs text-text">{title}</p>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md items-center gap-2">
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search order, customer, product"
                      className="w-full rounded-xl border border-ink/15 bg-[#f7f9fc] px-4 py-2 text-sm text-ink outline-none focus:border-[#6d8fb8]"
                    />
                    <button type="submit" className="rounded-xl bg-[#2d5da8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#244f93]">
                      Search
                    </button>
                  </form>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f4fb] text-[#45648f]">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                      <path d="M12 5a6 6 0 0 0-6 6v2.4l-1.2 2.1A1 1 0 0 0 5.7 17h12.6a1 1 0 0 0 .9-1.5L18 13.4V11a6 6 0 0 0-6-6Zm0 15a2.5 2.5 0 0 0 2.3-1.5h-4.6A2.5 2.5 0 0 0 12 20Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2d5da8] text-xs font-semibold text-white">
                    {initials || "AD"}
                  </div>
                </div>
              </div>
            </div>

            <div>{children}</div>
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
