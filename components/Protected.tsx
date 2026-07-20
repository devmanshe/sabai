"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isReady } = useSession()

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

export function RequireRole({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const router = useRouter();
  const { user, isReady } = useSession()
  const role = user?.user_metadata?.role as string | undefined

  useEffect(() => {
    if (isReady && (!user || !roles.includes(role ?? ""))) {
      router.replace("/");
    }
  }, [isReady, user, role, roles, router]);

  if (!isReady || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-text">
        Loading your access...
      </div>
    );
  }

  if (!role || !roles.includes(role)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-text">
        Access restricted.
      </div>
    );
  }

  return <>{children}</>;
}