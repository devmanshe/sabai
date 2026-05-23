"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import ProductCard from "@/components/ProductCard";
import { useApp } from "@/lib/store";

export default function CouplePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, categories } = useApp();

  const agency = searchParams.get("agency") ?? "all";
  const gender = searchParams.get("gender") ?? "all";

  const agencies = useMemo(
    () => categories.filter((entry) => entry.kind === "agency"),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const isCouple = product.category === "couple";
      const matchesAgency = agency === "all" ? true : product.agencyId === agency;
      const matchesGender = gender === "all" ? true : product.coupleGender === gender;
      return isCouple && matchesAgency && matchesGender;
    });
  }, [agency, gender, products]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `/couple?${query}` : "/couple");
  };

  const clearAll = () => router.push("/couple");

  return (
    <SiteShell>
      <section className="space-y-6">
        <div className="surface-card overflow-hidden p-0">
          <div className="bg-gradient-to-r from-ink to-sky px-6 py-8 text-white md:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">Couple Collection</p>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Daftar Couple yang Tersedia</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/85">
              Pilih couple berdasarkan agency asal dan gender. Semua item di sini difokuskan ke katalog couple.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="surface-card h-fit p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Filters</h2>
              <button type="button" className="btn-ghost text-xs" onClick={clearAll}>
                Reset
              </button>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <p className="mb-3 text-sm font-semibold text-ink">Agency</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => updateParam("agency", "all")}
                    className={`w-full rounded-xl border px-4 py-2 text-left text-sm font-semibold transition ${
                      agency === "all"
                        ? "border-ink bg-ink text-white"
                        : "border-ink/10 bg-white text-ink hover:bg-ice"
                    }`}
                  >
                    All Agency
                  </button>
                  {agencies.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => updateParam("agency", entry.id)}
                      className={`w-full rounded-xl border px-4 py-2 text-left text-sm font-semibold transition ${
                        agency === entry.id
                          ? "border-ink bg-ink text-white"
                          : "border-ink/10 bg-white text-ink hover:bg-ice"
                      }`}
                    >
                      {entry.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-ink">Gender</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "All", value: "all" },
                    { label: "Boys", value: "boys" },
                    { label: "Girls", value: "girls" }
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => updateParam("gender", item.value)}
                      className={`chip ${gender === item.value ? "border-ink/40 text-ink" : ""}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="surface-card flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-text">Selected Filters</p>
                <p className="text-sm text-ink">
                  Agency: <strong>{agency === "all" ? "All" : categories.find((entry) => entry.id === agency)?.name}</strong>
                  <span className="mx-2 text-text">|</span>
                  Gender: <strong>{gender === "all" ? "All" : gender}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="btn-secondary" onClick={() => updateParam("gender", "boys")}>
                  Boys
                </button>
                <button type="button" className="btn-secondary" onClick={() => updateParam("gender", "girls")}>
                  Girls
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.length === 0 ? (
                <div className="surface-card p-6 text-text sm:col-span-2 xl:col-span-3">
                  Tidak ada couple yang cocok dengan filter ini.
                </div>
              ) : (
                filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
