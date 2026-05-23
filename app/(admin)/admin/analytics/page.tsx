"use client";

import { useApp } from "@/lib/store";
import { useMemo } from "react";
import { RequireRole } from "@/components/Protected";

export default function AnalyticsPage() {
  const { orders, products, users } = useApp();

  // Most sold products
  const mostSoldProducts = useMemo(() => {
    const productSales: Record<string, { count: number; revenue: number; product: typeof products[0] }> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productSales[item.product.id]) {
          productSales[item.product.id] = { count: 0, revenue: 0, product: item.product };
        }
        productSales[item.product.id].count += item.qty;
        productSales[item.product.id].revenue += item.qty * item.product.price;
      });
    });
    return Object.values(productSales)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [orders, products]);

  // Total revenue
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.paymentStatus === "dp_paid" || o.paymentStatus === "fully_paid")
      .reduce((sum, order) => sum + order.amountPaid, 0);
  }, [orders]);

  // User growth - last 30 days
  const userGrowth = useMemo(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return users.filter((u) => new Date(u.createdAt) > thirtyDaysAgo).length;
  }, [users]);

  // Conversion rate (orders vs unique users)
  const conversionRate = useMemo(() => {
    if (users.length === 0) return "0%";
    const uniqueCustomers = new Set(orders.map((o) => o.customerName)).size;
    const rate = ((uniqueCustomers / users.length) * 100).toFixed(1);
    return `${rate}%`;
  }, [orders, users]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, { count: number; revenue: number }> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const category = item.product.category;
        if (!breakdown[category]) {
          breakdown[category] = { count: 0, revenue: 0 };
        }
        breakdown[category].count += item.qty;
        breakdown[category].revenue += item.qty * item.product.price;
      });
    });
    return Object.entries(breakdown).map(([category, data]) => ({
      category,
      ...data
    }));
  }, [orders]);

  // Daily revenue - last 30 days
  const dailyRevenue = useMemo(() => {
    const revenue: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      revenue[date] = 0;
    }
    orders.forEach((order) => {
      const date = order.createdAt.slice(0, 10);
      if (revenue[date] !== undefined && (order.paymentStatus === "dp_paid" || order.paymentStatus === "fully_paid")) {
        revenue[date] += order.amountPaid;
      }
    });
    return Object.entries(revenue).map(([date, amount]) => ({ date, amount }));
  }, [orders]);

  // Order status breakdown
  const orderStatusBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {
      "to_pay": 0,
      "on_process": 0,
      "ready": 0,
      "to_ship": 0,
      "to_receive": 0,
      "completed": 0,
      "cancelled": 0,
      "returned": 0
    };
    orders.forEach((order) => {
      if (breakdown[order.status] !== undefined) {
        breakdown[order.status]++;
      }
    });
    return Object.entries(breakdown)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({ status, count }));
  }, [orders]);

  return (
    <RequireRole roles={["superadmin"]}>
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">📈 Analytics</h1>
          <p className="text-sm text-text">Analisis mendalam tentang performa bisnis Sabai Merch</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` },
            { label: "Total Orders", value: orders.length.toString() },
            { label: "New Users (30d)", value: userGrowth.toString() },
            { label: "Conversion Rate", value: conversionRate }
          ].map((stat) => (
            <div key={stat.label} className="soft-panel p-5">
              <p className="text-xs uppercase tracking-wide text-text">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {/* Top Products */}
          <div className="soft-panel p-6">
            <h2 className="text-lg font-semibold">Top 10 Products</h2>
            <div className="mt-4 space-y-3">
              {mostSoldProducts.length === 0 ? (
                <p className="text-sm text-text">Belum ada penjualan produk.</p>
              ) : (
                mostSoldProducts.map((item, idx) => (
                  <div key={item.product.id} className="flex items-center justify-between rounded-lg bg-ice p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-ink">{item.product.name}</p>
                        <p className="text-xs text-text">${item.product.price} x {item.count} pcs</p>
                      </div>
                    </div>
                    <span className="font-bold text-ink">${item.revenue.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="soft-panel p-6">
            <h2 className="text-lg font-semibold">Sales by Category</h2>
            <div className="mt-4 space-y-3">
              {categoryBreakdown.length === 0 ? (
                <p className="text-sm text-text">Belum ada data kategori.</p>
              ) : (
                categoryBreakdown.map((item) => (
                  <div key={item.category} className="rounded-lg bg-ice p-3">
                    <div className="flex items-center justify-between">
                      <span className="capitalize font-medium text-ink">{item.category}</span>
                      <span className="text-sm font-semibold text-ink">${item.revenue.toFixed(2)}</span>
                    </div>
                    <p className="mt-1 text-xs text-text">{item.count} items sold</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {/* Daily Revenue Chart */}
          <div className="soft-panel p-6">
            <h2 className="text-lg font-semibold">Revenue Last 30 Days</h2>
            <div className="mt-4 space-y-2">
              {dailyRevenue.slice(-7).map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="w-20 text-sm font-medium text-text">{day.date}</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-ice">
                    <div
                      className="h-6 bg-gradient-to-r from-ink to-blue-600"
                      style={{
                        width: `${Math.min(100, (day.amount / Math.max(1, totalRevenue / 7)) * 100)}%`
                      }}
                    />
                  </div>
                  <span className="w-20 text-right text-sm font-semibold text-ink">${day.amount.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="soft-panel p-6">
            <h2 className="text-lg font-semibold">Order Status Distribution</h2>
            <div className="mt-4 space-y-3">
              {orderStatusBreakdown.length === 0 ? (
                <p className="text-sm text-text">Belum ada order.</p>
              ) : (
                orderStatusBreakdown.map((item) => (
                  <div key={item.status} className="flex items-center justify-between rounded-lg bg-ice p-3">
                    <span className="capitalize font-medium text-ink">{item.status.replace(/_/g, " ")}</span>
                    <span className="inline-block rounded-full bg-ink px-3 py-1 text-sm font-bold text-white">
                      {item.count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </RequireRole>
  );
}
