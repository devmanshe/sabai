"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import type { Order } from "@/lib/types";

type AdminOrderStage = "pending" | "paid" | "settlement" | "shipped" | "cancelled";

const stageOptions: { value: AdminOrderStage | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "settlement", label: "Waiting Settlement" },
  { value: "shipped", label: "Shipped" },
  { value: "cancelled", label: "Cancelled" }
];

const mapOrderToStage = (order: Order): AdminOrderStage => {
  if (order.status === "cancelled" || order.paymentStatus === "failed" || order.paymentStatus === "refunded") {
    return "cancelled";
  }

  if (order.status === "waiting_settlement") {
    return "settlement";
  }

  if (order.status === "to_ship" || order.status === "to_receive" || order.status === "completed") {
    return "shipped";
  }

  if (order.paymentStatus === "dp_paid" || order.paymentStatus === "fully_paid") {
    return "paid";
  }

  return "pending";
};

const formatMoney = (order: Order) =>
  new Intl.NumberFormat(order.currency === "IDR" ? "id-ID" : "en-US", {
    style: "currency",
    currency: order.currency,
    maximumFractionDigits: order.currency === "IDR" ? 0 : 2
  }).format(order.grandTotal);

const getBadgeClass = (stage: AdminOrderStage, order?: Order) => {
  if (order?.status === "waiting_external") return "bg-purple-100 text-purple-800";
  if (stage === "pending") return "bg-amber-100 text-amber-800";
  if (stage === "settlement") return "bg-orange-100 text-orange-800";
  if (stage === "paid") return "bg-sky-100 text-sky-800";
  if (stage === "shipped") return "bg-emerald-100 text-emerald-800";
  return "bg-rose-100 text-rose-800";
};

const getStatusDisplay = (stage: AdminOrderStage, order: Order) => {
  if (order.status === "waiting_external") return "⏳ Waiting External";
  return stage;
};

export default function AdminOrdersPage() {
  const { orders } = useApp();
  const searchParams = useSearchParams();
  const globalQuery = (searchParams.get("q") ?? "").toLowerCase();

  const [stageFilter, setStageFilter] = useState<AdminOrderStage | "all">("all");
  const [searchText, setSearchText] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const keyword = (searchText || globalQuery).toLowerCase();

  const rows = useMemo(() => {
    return orders
      .filter((order) => {
        const stage = mapOrderToStage(order);
        const createdDate = order.createdAt.slice(0, 10);
        const matchesStage = stageFilter === "all" ? true : stage === stageFilter;
        const matchesFrom = dateFrom ? createdDate >= dateFrom : true;
        const matchesTo = dateTo ? createdDate <= dateTo : true;
        const matchesSearch = keyword
          ? order.id.toLowerCase().includes(keyword) || order.customerName.toLowerCase().includes(keyword)
          : true;

        return matchesStage && matchesFrom && matchesTo && matchesSearch;
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [orders, stageFilter, dateFrom, dateTo, keyword]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Orders</h1>
        <p className="text-sm text-text">Daily work area: review, verify, and update order flow safely.</p>
      </div>

      <div className="surface-card grid gap-3 p-4 md:grid-cols-4">
        <select
          className="input-field"
          value={stageFilter}
          onChange={(event) => setStageFilter(event.target.value as AdminOrderStage | "all")}
        >
          {stageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          className="input-field"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search nama / order ID"
        />

        <input
          className="input-field"
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
        />

        <input
          className="input-field"
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
        />
      </div>

      <div className="surface-card overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-5 text-sm text-text">Tidak ada order sesuai filter.</div>
        ) : (
          <>
            <div className="hidden grid-cols-[1.4fr_1fr_0.8fr_0.8fr_1fr_1fr_0.8fr] gap-4 border-b border-ink/10 bg-white/80 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text md:grid">
              <span>Order ID</span>
              <span>User</span>
              <span>Total</span>
              <span>Status</span>
              <span>Payment Status</span>
              <span>Date</span>
              <span>Action</span>
            </div>

            {rows.map((order) => {
              const stage = mapOrderToStage(order);

              return (
                <div
                  key={order.id}
                  className="border-b border-ink/10 px-5 py-4 last:border-none"
                >
                  <div className="hidden grid-cols-[1.4fr_1fr_0.8fr_0.8fr_1fr_1fr_0.8fr] items-center gap-4 text-sm md:grid">
                    <div className="font-semibold text-ink">{order.id}</div>
                    <div>{order.customerName}</div>
                    <div>{formatMoney(order)}</div>
                    <div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getBadgeClass(stage, order)}`}>
                        {getStatusDisplay(stage, order)}
                      </span>
                    </div>
                    <div>{order.paymentStatus}</div>
                    <div>{new Date(order.createdAt).toLocaleDateString("id-ID")}</div>
                    <Link href={`/admin/orders/${encodeURIComponent(order.id)}`} className="btn-ghost text-center">
                      Detail
                    </Link>
                  </div>

                  <div className="space-y-2 md:hidden">
                    <div className="flex items-center justify-between">
                      <strong className="text-ink">{order.id}</strong>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getBadgeClass(stage, order)}`}>
                        {getStatusDisplay(stage, order)}
                      </span>
                    </div>
                    <p className="text-sm text-text">{order.customerName}</p>
                    <p className="text-sm text-text">
                      {formatMoney(order)} · {order.paymentStatus}
                    </p>
                    <Link href={`/admin/orders/${encodeURIComponent(order.id)}`} className="btn-ghost inline-block">
                      View Detail
                    </Link>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </section>
  );
}
