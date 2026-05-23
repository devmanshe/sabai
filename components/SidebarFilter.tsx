"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { categoryFilters, statusFilters } from "@/lib/data";

export default function SidebarFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const selectedStatus = searchParams.get("status") ?? "all";
  const selectedCategory = searchParams.get("category") ?? "all";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">Status</h3>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => updateParam("status", status.value)}
              className={`chip ${selectedStatus === status.value ? "border-ink/40 text-ink" : ""}`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">Category</h3>
        <div className="flex flex-wrap gap-2">
          {categoryFilters.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => updateParam("category", category.value)}
              className={`chip ${selectedCategory === category.value ? "border-ink/40 text-ink" : ""}`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
