"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";

export default function AdminDashboardPage() {
  const { user, orders, products, users } = useApp();
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").toLowerCase();
  const isSuperAdmin = user?.role === "superadmin";

  const today = new Date().toISOString().slice(0, 10);

  const filteredOrders = useMemo(() => {
    if (!query) return orders;
    return orders.filter((order) => {
      return (
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query)
      );
    });
  }, [orders, query]);

  const todayOrders = filteredOrders.filter((order) => order.createdAt.slice(0, 10) === today);
  const pendingOrders = filteredOrders.filter(
    (order) =>
      order.paymentStatus === "unpaid" ||
      order.status === "to_pay"
  );
  const paidOrders = filteredOrders.filter(
    (order) => order.paymentStatus === "dp_paid" || order.paymentStatus === "fully_paid"
  );
  const shippedOrders = filteredOrders.filter(
    (order) => order.status === "to_ship" || order.status === "to_receive" || order.status === "completed"
  );

  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter((entry) => entry.paymentStatus === "dp_paid" || entry.paymentStatus === "fully_paid")
      .reduce((sum, entry) => sum + entry.amountPaid, 0);
  }, [filteredOrders]);

  const conversionRate = useMemo(() => {
    if (!users.length) return 0;
    const buyerCount = new Set(filteredOrders.map((entry) => entry.customerName)).size;
    return Math.min(100, Number(((buyerCount / users.length) * 100).toFixed(1)));
  }, [filteredOrders, users]);

  const activePreorders = useMemo(
    () => products.filter((entry) => entry.status === "preorder").length,
    [products]
  );

  const activeProducts = useMemo(
    () => products.filter((entry) => entry.status !== "closed").length,
    [products]
  );

  const newUsers = useMemo(() => {
    const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    return users.filter((entry) => entry.createdAt > threshold && entry.role === "user").length;
  }, [users]);

  const recentOrders = useMemo(
    () => [...filteredOrders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6),
    [filteredOrders]
  );

  const bestSellingProducts = useMemo(() => {
    const salesMap: Record<string, { name: string; sold: number; revenue: number }> = {};
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!salesMap[item.product.id]) {
          salesMap[item.product.id] = {
            name: item.product.name,
            sold: 0,
            revenue: 0
          };
        }
        salesMap[item.product.id].sold += item.qty;
        salesMap[item.product.id].revenue += item.product.price * item.qty;
      });
    });
    return Object.values(salesMap)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 6);
  }, [filteredOrders]);

  const monthlyOverview = useMemo(() => {
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const months = monthLabels.map((label, index) => ({
      label,
      monthIndex: index,
      revenue: 0,
      count: 0
    }));

    filteredOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      const idx = date.getMonth();
      if (idx >= 0 && idx < 6) {
        months[idx].revenue += order.baseGrandTotal;
        months[idx].count += 1;
      }
    });

    const maxRevenue = Math.max(1, ...months.map((entry) => entry.revenue));
    const maxCount = Math.max(1, ...months.map((entry) => entry.count));

    return months.map((entry) => ({
      ...entry,
      revenuePercent: Math.round((entry.revenue / maxRevenue) * 100),
      countPercent: Math.round((entry.count / maxCount) * 100)
    }));
  }, [filteredOrders]);

  const kpiCards = isSuperAdmin
    ? [
        { label: "Total Revenue", value: `Rp ${totalRevenue.toLocaleString("id-ID")}`, delta: "+11.9%" },
        { label: "Total Orders", value: filteredOrders.length.toString(), delta: "+7.2%" },
        { label: "Products Active", value: activeProducts.toString(), delta: "+2.4%" },
        { label: "Customers", value: users.filter((entry) => entry.role === "user").length.toString(), delta: "+5.4%" },
        { label: "Conversion Rate", value: `${conversionRate}%`, delta: "+0.8%" }
      ]
    : [
        { label: "Orders Today", value: todayOrders.length.toString(), delta: "+4.2%" },
        { label: "Pending Orders", value: pendingOrders.length.toString(), delta: "Need Action" },
        { label: "Paid Orders", value: paidOrders.length.toString(), delta: "+6.1%" },
        { label: "Shipped", value: shippedOrders.length.toString(), delta: "+3.8%" },
        { label: "Active Preorders", value: activePreorders.toString(), delta: "Monitor" }
      ];

  const quickList = isSuperAdmin
    ? products
        .filter((entry) => entry.stock <= 20 || entry.status === "preorder")
        .slice(0, 6)
        .map((entry) => ({
          key: entry.id,
          title: entry.name,
          meta: entry.stock <= 20 ? `Low stock: ${entry.stock}` : "Preorder active",
          href: "/admin/products"
        }))
    : pendingOrders.slice(0, 6).map((entry) => ({
        key: entry.id,
        title: entry.customerName,
        meta: `${entry.id} - ${entry.paymentStatus}`,
        href: `/admin/orders/${encodeURIComponent(entry.id)}`
      }));

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {kpiCards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-[#dbe3ef] bg-white p-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6f84a3]">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-[#2d4f79]">{card.value}</p>
            <p className="mt-1 text-xs font-semibold text-[#4e7db1]">{card.delta}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr_1fr]">
        <article className="rounded-2xl border border-[#dbe3ef] bg-white p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#2d4f79]">Sales Overview</h2>
              <p className="text-xs text-[#8196b0]">Revenue vs Orders</p>
            </div>
            <span className="rounded-lg bg-[#eef3fb] px-2 py-1 text-[11px] font-semibold text-[#5b78a0]">Monthly</span>
          </div>

          <div className="h-[220px] rounded-xl bg-gradient-to-b from-[#f5f9ff] to-[#eff3f8] p-4">
            <div className="flex h-full items-end justify-between gap-2">
              {monthlyOverview.map((entry) => (
                <div key={entry.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <div className="flex w-full items-end justify-center gap-1">
                    <div
                      className="w-2 rounded-t-md bg-[#4f87c8]"
                      style={{ height: `${Math.max(8, entry.revenuePercent)}%` }}
                    />
                    <div
                      className="w-2 rounded-t-md bg-[#8db4de]"
                      style={{ height: `${Math.max(8, entry.countPercent)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#7b8da6]">{entry.label}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[#dbe3ef] bg-white p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2d4f79]">Best Selling Products</h2>
            <span className="rounded-lg bg-[#eef3fb] px-2 py-1 text-[11px] font-semibold text-[#5b78a0]">Monthly</span>
          </div>
          <div className="space-y-2">
            {bestSellingProducts.length === 0 ? (
              <p className="rounded-xl bg-[#f7faff] p-3 text-sm text-[#6f84a3]">No sales data yet.</p>
            ) : (
              bestSellingProducts.slice(0, 5).map((entry, idx) => (
                <div key={entry.name} className="flex items-center justify-between rounded-xl bg-[#f7faff] px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-[#2d4f79]">{idx + 1}. {entry.name}</p>
                    <p className="text-xs text-[#8196b0]">{entry.sold} sold</p>
                  </div>
                  <strong className="text-sm text-[#2f5e9e]">${entry.revenue.toFixed(2)}</strong>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-[#dbe3ef] bg-white p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2d4f79]">Recent Orders</h2>
            <Link href="/admin/orders" className="rounded-lg bg-[#ffd96f] px-3 py-1.5 text-xs font-bold text-[#5a4705] hover:bg-[#ffcf4a]">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders.length === 0 ? (
              <p className="rounded-xl bg-[#f7faff] p-3 text-sm text-[#6f84a3]">No order activity.</p>
            ) : (
              recentOrders.map((entry) => (
                <div key={entry.id} className="rounded-xl bg-[#f7faff] px-3 py-2.5">
                  <p className="text-sm font-semibold text-[#2d4f79]">{entry.id}</p>
                  <p className="text-xs text-[#6f84a3]">{entry.customerName}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-[#8196b0]">
                    <span>{new Date(entry.createdAt).toLocaleDateString("id-ID")}</span>
                    <span>{entry.paymentStatus}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <article className="rounded-2xl border border-[#dbe3ef] bg-white p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2d4f79]">Top Products Snapshot</h2>
            <Link href="/admin/products" className="rounded-lg border border-[#cad8ea] px-3 py-1.5 text-xs font-semibold text-[#4d6f9d] hover:bg-[#f3f7fd]">
              Manage
            </Link>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {bestSellingProducts.slice(0, 6).map((entry) => (
              <div key={entry.name} className="rounded-xl bg-[#f7faff] px-3 py-2.5">
                <p className="text-sm font-semibold text-[#2d4f79]">{entry.name}</p>
                <p className="text-xs text-[#6f84a3]">{entry.sold} sold</p>
                <p className="mt-1 text-xs font-semibold text-[#4d6f9d]">${entry.revenue.toFixed(2)}</p>
              </div>
            ))}
            {bestSellingProducts.length === 0 && (
              <p className="rounded-xl bg-[#f7faff] p-3 text-sm text-[#6f84a3]">No best-seller data yet.</p>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-[#dbe3ef] bg-white p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2d4f79]">{isSuperAdmin ? "Business Alerts" : "Needs Action"}</h2>
            <span className="rounded-lg bg-[#eef3fb] px-2 py-1 text-[11px] font-semibold text-[#5b78a0]">Live</span>
          </div>
          <div className="space-y-2">
            {quickList.length === 0 ? (
              <p className="rounded-xl bg-[#f7faff] p-3 text-sm text-[#6f84a3]">All clear for now.</p>
            ) : (
              quickList.map((entry) => (
                <Link key={entry.key} href={entry.href} className="block rounded-xl border border-[#d8e3f3] bg-[#f7faff] px-3 py-2.5 hover:bg-[#eef4fd]">
                  <p className="text-sm font-semibold text-[#2d4f79]">{entry.title}</p>
                  <p className="text-xs text-[#6f84a3]">{entry.meta}</p>
                </Link>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
