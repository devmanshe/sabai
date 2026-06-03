"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteShell from "@/components/SiteShell";
import { RequireAuth } from "@/components/Protected";
import { useApp } from "@/lib/store";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

const statusTabs: { value: "all" | OrderStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "to_pay", label: "To Pay" },
  { value: "on_process", label: "On Process" },
  { value: "ready", label: "Ready" },
  { value: "waiting_settlement", label: "Waiting Settlement" },
  { value: "to_ship", label: "To Ship" },
  { value: "to_receive", label: "To Receive" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" }
];

const badgeLabel: Record<OrderStatus, string> = {
  to_pay: "To Pay",
  on_process: "On Process",
  ready: "Ready",
  waiting_settlement: "Waiting Settlement",
  to_ship: "To Ship",
  to_receive: "To Receive",
  completed: "Completed",
  cancelled: "Cancelled",
  returned: "Returned"
};

const paymentBadgeLabel: Record<PaymentStatus, string> = {
  to_pay: "To Pay",
  pending: "To Pay",
  dp_paid: "DP Paid",
  fully_paid: "Fully Paid",
  failed: "Failed",
  refunded: "Refunded"
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
};

const formatMoney = (value: number, currency: "IDR" | "USD" | "JPY") =>
  new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2
  }).format(value);

export default function OrdersPage() {
  const { orders, isReady } = useApp();
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter((order) => order.status === activeTab);
  }, [activeTab, orders]);

  return (
    <SiteShell>
      <RequireAuth>
        <section className="mx-auto w-full max-w-5xl rounded-[28px] bg-[#f2f4f7] p-6 md:p-8">
          <div className="mb-8 flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#c9d2dc] text-[#2f4050]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M3 8.5 12 3l9 5.5-9 5.5L3 8.5Zm0 7L12 21l9-5.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-[#203247]">My Orders</h1>
          </div>

          <div className="mb-6 overflow-x-auto border-b border-[#d5dce4]">
            <div className="flex min-w-max gap-8">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`border-b-2 pb-3 text-[15px] font-medium transition ${
                    activeTab === tab.value
                      ? "border-[#16a7be] text-[#0f9ab4]"
                      : "border-transparent text-[#5f6f82] hover:text-[#203247]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {!isReady ? (
              <div className="rounded-2xl bg-white p-6 text-sm text-[#5f6f82] shadow-sm">
                Loading your orders...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 text-sm text-[#5f6f82] shadow-sm">
                Belum ada pesanan di status ini.
              </div>
            ) : (
              filteredOrders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-2xl border border-[#e6e9ee] bg-white px-6 py-5 shadow-[0_4px_10px_rgba(31,58,84,0.08)]"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <h2 className="text-xl font-bold tracking-tight text-[#1f3951]">
                          {order.id}
                        </h2>
                        <span className="text-sm text-[#6f8196]">{formatDate(order.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-[17px] text-[#596b80]">
                        {order.itemCount} item(s) · {order.paymentMethod} · Ref {order.paymentReference}
                      </p>
                      <p className="mt-1 text-sm text-[#6f8196]">
                        Payment: {paymentBadgeLabel[order.paymentStatus]}
                        {order.paymentProofName ? ` · Bukti: ${order.paymentProofName}` : ""}
                      </p>
                      {order.status === "ready" && order.paymentType === "dp" && order.remainingAmount > 0 && (
                        <div className="mt-2 space-y-2">
                          <p className="text-sm font-semibold text-[#0f9ab4]">
                            Barang telah tiba di Indonesia 🎉 Silakan lakukan pelunasan untuk melanjutkan pengiriman.
                          </p>
                          <Link
                            href={`/checkout?settlementOrderId=${encodeURIComponent(order.id)}`}
                            className="inline-flex rounded-full bg-[#16a7be] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1096ad]"
                          >
                            Lunasi Sekarang
                          </Link>
                        </div>
                      )}
                      {order.status === "ready" && order.shipping_method && order.shipping_method !== "lion_parcel" && (
                        <p className="mt-1 text-sm text-[#6f8196]">
                          Link checkout {order.shipping_method === "shopee" ? "Shopee" : "TikTok"} akan dikirim oleh admin.
                        </p>
                      )}
                      {order.status === "waiting_settlement" && (
                        <p className="mt-1 text-sm font-semibold text-[#b26b00]">
                          Menunggu verifikasi pelunasan dari admin.
                        </p>
                      )}
                      {order.paymentType === "dp" && order.remainingAmount > 0 && (
                        <p className="mt-1 text-sm font-semibold text-[#b26b00]">
                          Sisa pembayaran: {formatMoney(order.remainingAmount, order.currency)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-center">
                      <span className="rounded-full bg-[#d8ecff] px-4 py-1 text-sm font-semibold text-[#0b5dad]">
                        {badgeLabel[order.status]}
                      </span>
                      <strong className="text-xl font-bold text-[#0f9ab4]">
                        {formatMoney(order.grandTotal, order.currency)}
                      </strong>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </RequireAuth>
    </SiteShell>
  );
}
