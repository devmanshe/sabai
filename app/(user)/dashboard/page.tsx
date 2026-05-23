"use client";

import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { RequireAuth } from "@/components/Protected";
import { useApp } from "@/lib/store";

export default function UserDashboardPage() {
  const { user, profileComplete } = useApp();

  return (
    <SiteShell>
      <RequireAuth>
        <section className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">Welcome back, {user?.name}</h1>
            <p className="text-sm text-text">Manage your GO activity and account details.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="soft-panel space-y-3 p-5">
              <h2 className="text-lg font-semibold">Profile readiness</h2>
              <p className="text-sm text-text">
                {profileComplete ? "You are ready to checkout." : "Complete your profile to checkout."}
              </p>
              <Link href="/profile" className="btn-primary w-fit">
                Update profile
              </Link>
            </div>
            <div className="soft-panel space-y-3 p-5">
              <h2 className="text-lg font-semibold">Recent orders</h2>
              <p className="text-sm text-text">View your group order status in one place.</p>
              <Link href="/orders" className="btn-ghost w-fit">
                View orders
              </Link>
            </div>
          </div>
        </section>
      </RequireAuth>
    </SiteShell>
  );
}
