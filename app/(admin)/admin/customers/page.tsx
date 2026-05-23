"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useApp } from "@/lib/store";

export default function AdminCustomersPage() {
  const { orders } = useApp();

  const customers = useMemo(() => {
    const grouped = orders.reduce<Record<string, { name: string; phone: string; totalOrders: number }>>(
      (acc, order) => {
        const key = `${order.customerName}-${order.customerPhone}`;
        if (!acc[key]) {
          acc[key] = {
            name: order.customerName,
            phone: order.customerPhone,
            totalOrders: 0
          };
        }
        acc[key].totalOrders += 1;
        return acc;
      },
      {}
    );

    return Object.values(grouped).sort((a, b) => b.totalOrders - a.totalOrders);
  }, [orders]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Customers</h1>
          <p className="text-sm text-text">Lihat pelanggan dan riwayat order untuk follow-up support.</p>
        </div>
        <Link href="/admin/orders" className="btn-ghost">
          Open Orders
        </Link>
      </div>

      <div className="surface-card overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-5 text-sm text-text">Belum ada data customer.</div>
        ) : (
          <>
            <div className="hidden grid-cols-[1.4fr_1fr_0.8fr] gap-4 border-b border-ink/10 bg-white/80 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text md:grid">
              <span>Customer</span>
              <span>Phone</span>
              <span>Total Orders</span>
            </div>
            {customers.map((customer) => (
              <div key={`${customer.name}-${customer.phone}`} className="grid gap-2 border-b border-ink/10 px-5 py-4 text-sm last:border-none md:grid-cols-[1.4fr_1fr_0.8fr] md:items-center">
                <strong className="text-ink">{customer.name}</strong>
                <span className="text-text">{customer.phone}</span>
                <span className="font-semibold text-ink">{customer.totalOrders}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
