"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/types";
import { useApp } from "@/lib/store";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isReady } = useApp();

  useEffect(() => {
    if (isReady && !user) {
      router.replace("/auth");
    }
  }, [isReady, user, router]);

  if (!isReady || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-text">
        Loading your access...
      </div>
    );
  }

  return <>{children}</>;
}

export function RequireRole({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const router = useRouter();
  const { user, isReady } = useApp();

  useEffect(() => {
    if (isReady && (!user || !roles.includes(user.role))) {
      router.replace("/");
    }
  }, [isReady, user, roles, router]);

  if (!isReady || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-text">
        Loading your access...
      </div>
    );
  }

  if (!roles.includes(user.role)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-text">
        Access restricted.
      </div>
    );
  }

  return <>{children}</>;
}
