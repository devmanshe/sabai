"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Heart,
  Package,
  Layers,
  ClipboardList,
  CreditCard,
  Truck,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { RequireRole } from "@/components/Protected";
import { AppProvider, useApp } from "@/lib/store";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/superadmin/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: "Manajemen User",
    icon: <Users className="h-4 w-4" />,
    children: [
      { label: "Buyer", href: "/superadmin/manage/users/buyer" },
      { label: "Admin", href: "/superadmin/manage/users/admin" },
    ],
  },
  {
    label: "Manage Agency",
    href: "/superadmin/manage/agency",
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    label: "Manage Couple",
    href: "/superadmin/manage/couple",
    icon: <Heart className="h-4 w-4" />,
  },
  {
    label: "Manage Product",
    href: "/superadmin/manage/products",
    icon: <Package className="h-4 w-4" />,
  },
  {
    label: "Manage Batch",
    href: "/superadmin/manage/batches",
    icon: <Layers className="h-4 w-4" />,
  },
  {
    label: "Manage Order",
    href: "/superadmin/manage/orders",
    icon: <ClipboardList className="h-4 w-4" />,
  },
  {
    label: "Payment",
    href: "/superadmin/manage/payments",
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    label: "Shipment",
    href: "/superadmin/manage/shipments",
    icon: <Truck className="h-4 w-4" />,
  },
  {
    label: "Settings",
    href: "/superadmin/settings",
    icon: <Settings className="h-4 w-4" />,
  },
];

function SuperadminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useApp();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Manajemen User": true,
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const initials = (user?.name || "SA")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <aside className="flex h-full flex-col rounded-3xl bg-gradient-to-b from-[#315790] via-[#2b4e84] to-[#1f3f72] p-4 text-white shadow-lg">
      {/* Profile card */}
      <div className="rounded-2xl border border-white/20 bg-white/10 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-sm font-bold">
            {initials || "SA"}
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">
              {user?.name || "Super Admin"}
            </p>
            <p className="text-xs text-white/80">Super Admin</p>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-white/75">
          Full system management and business strategy
        </p>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1">
        {navItems.map((item) => {
          if (item.children) {
            const isOpen = openGroups[item.label] ?? false;
            const isChildActive = item.children.some(
              (child) => pathname === child.href
            );
            return (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => toggleGroup(item.label)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isChildActive
                      ? "bg-white/20 text-white"
                      : "text-white/85 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  {isOpen ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
                {isOpen && (
                  <div className="ml-7 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const active = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                            active
                              ? "bg-white text-[#2b4e84] font-semibold shadow-sm"
                              : "text-white/80 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              active ? "bg-[#2b4e84]" : "bg-white/40"
                            }`}
                          />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href!}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-white text-[#2b4e84] shadow-sm"
                  : "text-white/85 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="flex w-full items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

function SuperadminShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#eff2f8] p-3 md:p-4">
      <div className="mx-auto grid max-w-[1500px] gap-4 lg:grid-cols-[240px_1fr]">
        {/* Mobile menu toggle */}
        <button
          type="button"
          className="flex w-fit items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-[#2b4e84] shadow-sm lg:hidden"
          onClick={() => setDrawerOpen((prev) => !prev)}
        >
          {drawerOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
          {drawerOpen ? "Close Menu" : "Menu"}
        </button>

        {/* Sidebar */}
        <div
          className={`${
            drawerOpen ? "block" : "hidden lg:flex"
          } lg:min-h-[calc(100vh-32px)] lg:flex-col`}
        >
          <SuperadminSidebar onClose={() => setDrawerOpen(false)} />
        </div>

        {/* Main content */}
        <div className="min-w-0 space-y-4">
          <div className="rounded-3xl border border-[#dfe6f1] bg-white px-4 py-3 shadow-sm">
            <h1 className="text-lg font-semibold text-[#2f4f75]">
              Superadmin Panel
            </h1>
            <p className="text-xs text-[#6f84a3]">
              Full system management and control
            </p>
          </div>
          <AppProvider>{children}</AppProvider>
        </div>
      </div>
    </div>
  );
}

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <RequireRole roles={["superadmin"]}>
        <SuperadminShell>{children}</SuperadminShell>
      </RequireRole>
    </AppProvider>
  );
}
