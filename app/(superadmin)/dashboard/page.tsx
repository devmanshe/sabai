"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { useDashboardCounts } from "@/hooks/useDashboard";

export default function SuperadminDashboardPage() {
  const { orders, products, users } = useApp();
  const { data: counts } = useDashboardCounts();

  const totalRevenue = useMemo(
    () =>
      orders
        .filter(
          (o) =>
            o.paymentStatus === "dp_paid" || o.paymentStatus === "fully_paid"
        )
        .reduce((sum, o) => sum + o.amountPaid, 0),
    [orders]
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 6),
    [orders]
  );

  const bestSelling = useMemo(() => {
    const map: Record<string, { name: string; sold: number; revenue: number }> =
      {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!map[item.product.id]) {
          map[item.product.id] = {
            name: item.product.name,
            sold: 0,
            revenue: 0,
          };
        }
        map[item.product.id].sold += item.qty;
        map[item.product.id].revenue += item.product.price * item.qty;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [orders]);

  // Monthly chart data — last 6 months
  const monthlyOverview = useMemo(() => {
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const months = monthLabels.map((label, index) => ({
      label,
      monthIndex: index,
      revenue: 0,
      count: 0,
    }));
    orders.forEach((order) => {
      const idx = new Date(order.createdAt).getMonth();
      if (idx >= 0 && idx < 6) {
        months[idx].revenue += order.baseGrandTotal;
        months[idx].count += 1;
      }
    });
    const maxRevenue = Math.max(1, ...months.map((m) => m.revenue));
    const maxCount = Math.max(1, ...months.map((m) => m.count));
    return months.map((m) => ({
      ...m,
      revenuePercent: Math.round((m.revenue / maxRevenue) * 100),
      countPercent: Math.round((m.count / maxCount) * 100),
    }));
  }, [orders]);

  const kpiCards = [
    {
      label: "Total User",
      value: counts?.userCount ?? users.filter((u) => u.role === "user").length,
      note: "From profile table",
    },
    {
      label: "Total Product",
      // counts.productCount from Supabase; fallback to local store products
      value: counts?.productCount ?? products.length,
      note: "From products table",
    },
    {
      label: "Total Order",
      // NOTE: Orders currently live in local state (lib/store.tsx).
      // Migrate to Supabase-backed orders when backend work is complete.
      value: orders.length,
      note: "Local state (pending migration)",
    },
    {
      label: "Total Revenue",
      value: `Rp ${totalRevenue.toLocaleString("id-ID")}`,
      note: "Paid/partially paid orders",
    },
  ];

  return (
    <section className="space-y-4">
      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-[#dbe3ef] bg-white p-4 shadow-sm"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6f84a3]">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#2d4f79]">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-[#8196b0]">{card.note}</p>
          </article>
        ))}
      </div>

      {/* Charts + Lists */}
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* Grafik Penjualan */}
        <article className="rounded-2xl border border-[#dbe3ef] bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#2d4f79]">
                Grafik Penjualan
              </h2>
              <p className="text-xs text-[#8196b0]">
                Revenue vs Jumlah Order (Jan–Jun)
              </p>
            </div>
            <span className="rounded-lg bg-[#eef3fb] px-2 py-1 text-[11px] font-semibold text-[#5b78a0]">
              Monthly
            </span>
          </div>
          <div className="h-[220px] rounded-xl bg-gradient-to-b from-[#f5f9ff] to-[#eff3f8] p-4">
            <div className="flex h-full items-end justify-between gap-2">
              {monthlyOverview.map((entry) => (
                <div
                  key={entry.label}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="flex w-full items-end justify-center gap-1">
                    <div
                      className="w-2 rounded-t-md bg-[#4f87c8]"
                      style={{ height: `${Math.max(8, entry.revenuePercent)}%` }}
                      title={`Revenue: ${entry.revenuePercent}%`}
                    />
                    <div
                      className="w-2 rounded-t-md bg-[#8db4de]"
                      style={{ height: `${Math.max(8, entry.countPercent)}%` }}
                      title={`Orders: ${entry.count}`}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#7b8da6]">
                    {entry.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-[#8196b0]">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-3 rounded-sm bg-[#4f87c8]" />
              Revenue
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-3 rounded-sm bg-[#8db4de]" />
              Jumlah Order
            </span>
          </div>
        </article>

        {/* Best Selling */}
        <article className="rounded-2xl border border-[#dbe3ef] bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2d4f79]">
              Produk Terlaris
            </h2>
            <Link
              href="/superadmin/manage/products"
              className="rounded-lg border border-[#cad8ea] px-3 py-1.5 text-xs font-semibold text-[#4d6f9d] hover:bg-[#f3f7fd]"
            >
              Kelola
            </Link>
          </div>
          <div className="space-y-2">
            {bestSelling.length === 0 ? (
              <p className="rounded-xl bg-[#f7faff] p-3 text-sm text-[#6f84a3]">
                Belum ada data penjualan.
              </p>
            ) : (
              bestSelling.map((entry, idx) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between rounded-xl bg-[#f7faff] px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#2d4f79]">
                      {idx + 1}. {entry.name}
                    </p>
                    <p className="text-xs text-[#8196b0]">{entry.sold} terjual</p>
                  </div>
                  <strong className="text-sm text-[#2f5e9e]">
                    Rp {entry.revenue.toLocaleString("id-ID")}
                  </strong>
                </div>
              ))
            )}
          </div>
        </article>
      </div>

      {/* Recent Orders */}
      <article className="rounded-2xl border border-[#dbe3ef] bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2d4f79]">
            Order Terbaru
          </h2>
          <Link
            href="/superadmin/manage/orders"
            className="rounded-lg bg-[#ffd96f] px-3 py-1.5 text-xs font-bold text-[#5a4705] hover:bg-[#ffcf4a]"
          >
            Lihat Semua
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="rounded-xl bg-[#f7faff] p-3 text-sm text-[#6f84a3]">
            Belum ada order.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl bg-[#f7faff] px-3 py-2.5"
              >
                <p className="text-sm font-semibold text-[#2d4f79]">
                  {order.id}
                </p>
                <p className="text-xs text-[#6f84a3]">{order.customerName}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-[#8196b0]">
                  <span>
                    {new Date(order.createdAt).toLocaleDateString("id-ID")}
                  </span>
                  <span>{order.paymentStatus}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
