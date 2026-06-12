"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import SiteShell from "@/components/SiteShell";
import { RequireAuth } from "@/components/Protected";
import AppToast from "@/components/AppToast";
import { useApp } from "@/lib/store";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/types";

const statusLabel: Record<OrderStatus, { label: string; className: string }> = {
  to_pay: { label: "To Pay", className: "bg-[#fff2f2] text-[#b73a3a]" },
  on_process: { label: "On Process", className: "bg-[#fff7d9] text-[#9b6b01]" },
  ready: { label: "Ready", className: "bg-[#e8faf2] text-[#2a7a4c]" },
  waiting_settlement: { label: "Waiting Settlement", className: "bg-[#fff5e8] text-[#b36a00]" },
  to_ship: { label: "To Ship", className: "bg-[#e8f3ff] text-[#1a69a5]" },
  to_receive: { label: "To Receive", className: "bg-[#ecf7ff] text-[#13557b]" },
  completed: { label: "Completed", className: "bg-[#e9f5ea] text-[#1f6d34]" },
  cancelled: { label: "Cancelled", className: "bg-[#faf0f0] text-[#8f2d2d]" },
  returned: { label: "Returned", className: "bg-[#f3f1fb] text-[#4f3e73]" }
};

const paymentStatusLabel: Record<PaymentStatus, string> = {
  to_pay: "To Pay",
  pending: "Pending",
  dp_paid: "Partially Paid",
  fully_paid: "Fully Paid",
  failed: "Failed",
  refunded: "Refunded"
};

const paymentTypeLabel: Record<Order["paymentType"], string> = {
  full: "Full Payment",
  dp: "Down Payment"
};

const shippingMethodLabel: Record<Order["shipping_method"], string> = {
  lion_parcel: "Lion Parcel",
  shopee: "Checkout via Shopee",
  tiktok: "Checkout via TikTok Shop"
};

const getStatusLabel = (status: OrderStatus | string | undefined) => {
  if (status && statusLabel[status as OrderStatus]) {
    return statusLabel[status as OrderStatus];
  }
  return { label: String(status ?? "Unknown"), className: "bg-[#f3f3f3] text-[#5f6f82]" };
};

const getPaymentTypeLabel = (type: Order["paymentType"] | string | undefined) => {
  return paymentTypeLabel[type as Order["paymentType"]] ?? String(type ?? "Unknown");
};

const getShippingMethodLabel = (method: Order["shipping_method"] | string | undefined) => {
  return shippingMethodLabel[method as Order["shipping_method"]] ?? String(method ?? "Unknown");
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
};

const formatMoney = (value: number, currency: "IDR" | "USD" | "JPY") =>
  new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2
  }).format(value);

const buildTimeline = (order: Order) => {
  const events: Array<{ title: string; date?: string; active: boolean }> = [
    {
      title: "Order Created",
      date: formatDate(order.createdAt),
      active: true
    }
  ];

  if (order.paymentProofName) {
    events.push({
      title: "Payment Submitted",
      date: formatDate(order.createdAt),
      active: true
    });
  }

  if (order.paymentStatus === "dp_paid" || order.paymentStatus === "fully_paid") {
    events.push({
      title: "Payment Verified",
      date: formatDate(order.createdAt),
      active: true
    });
  }

  if (order.status !== "to_pay" && order.status !== "on_process") {
    events.push({
      title: "Batch Closed",
      date: order.settlement_due_date ? formatDate(order.settlement_due_date) : undefined,
      active: true
    });
  }

  if (order.shipment_status === "arrived_indonesia") {
    events.push({
      title: "Arrived at Indonesia Warehouse",
      date: order.settlement_due_date ? formatDate(order.settlement_due_date) : undefined,
      active: true
    });
  }

  if (["to_ship", "to_receive", "completed"].includes(order.status)) {
    events.push({
      title: "Shipped to Customer",
      date: formatDate(order.createdAt),
      active: true
    });
  }

  if (order.status === "completed") {
    events.push({
      title: "Delivered",
      date: formatDate(order.createdAt),
      active: true
    });
  }

  return events;
};

export default function OrderDetailPage() {
  const params = useParams() as { id?: string };
  const { orders, updateOrder } = useApp();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [toast, setToast] = useState({ open: false, variant: "success" as "success" | "error", title: "", message: "" });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const order = useMemo(
    () => orders.find((item) => item.id.replace(/^#/, "") === orderId || item.id === orderId),
    [orders, orderId]
  );

  const openToast = (variant: "success" | "error", title: string, message: string) => {
    setToast({ open: true, variant, title, message });
  };

  const closeToast = () => setToast((prev) => ({ ...prev, open: false }));

  const handleProofUploadClick = () => {
    if (!order) return;
    fileInputRef.current?.click();
  };

  const handleProofFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !order) return;

    updateOrder(order.id, {
      paymentProofName: file.name,
      paymentStatus: "pending"
    });

    openToast("success", "Bukti pembayaran dikirim", "Admin akan memverifikasi bukti pembayaran Anda.");
    event.target.value = "";
  };

  const handleCancelOrder = () => {
    if (!order) return;
    updateOrder(order.id, { status: "cancelled" });
    openToast("success", "Pesanan dibatalkan", "Pesanan Anda sudah dibatalkan.");
  };

  if (!order) {
    return (
      <SiteShell>
        <RequireAuth>
          <section className="mx-auto w-full max-w-5xl rounded-[28px] bg-[#f2f4f7] p-6 md:p-8">
            <div className="rounded-2xl border border-[#e6e9ee] bg-white p-8 text-center">
              <h1 className="text-2xl font-semibold text-[#203247]">Pesanan tidak ditemukan</h1>
              <p className="mt-3 text-sm text-[#5f6f82]">Coba kembali ke halaman pesanan untuk memilih order yang tersedia.</p>
              <Link href="/orders" className="mt-6 inline-flex rounded-full bg-[#16a7be] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1096ad]">
                Kembali ke My Orders
              </Link>
            </div>
          </section>
        </RequireAuth>
      </SiteShell>
    );
  }

  const batchStart = new Date(order.createdAt);
  const batchEnd = new Date(batchStart.valueOf() + 14 * 24 * 60 * 60 * 1000);
  const batchEstimated = new Date(batchStart.valueOf() + 28 * 24 * 60 * 60 * 1000);

  const batchStatus = order.shipment_status === "arrived_indonesia" ? "Arrived in Indonesia" : "Active";
  const dpRate = order.paymentType === "dp" ? Math.round(((order.dp_amount ?? order.grandTotal * 0.5) / order.grandTotal) * 100) : 100;
  const activeStatus = getStatusLabel(order.status);
  const timeline = useMemo(() => buildTimeline(order), [order]);

  return (
    <SiteShell>
      <RequireAuth>
        <AppToast
          open={toast.open}
          variant={toast.variant}
          title={toast.title}
          message={toast.message}
          onClose={closeToast}
          autoHideMs={3000}
        />

        <section className="mx-auto w-full max-w-6xl rounded-[28px] bg-[#f2f4f7] p-6 md:p-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5f6f82]">Order Detail</p>
              <h1 className="mt-3 text-4xl font-semibold text-[#203247]">{order.id.replace(/^#/, "")}</h1>
            </div>
            <Link
              href="/orders"
              className="inline-flex items-center rounded-full border border-[#d5dce4] bg-white px-4 py-2 text-sm font-semibold text-[#203247] transition hover:border-[#16a7be] hover:text-[#0f9ab4]"
            >
              ← Kembali ke My Orders
            </Link>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${activeStatus.className}`}>
                        {activeStatus.label}
                      </span>
                      <span className="text-sm text-[#6f8196]">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="text-sm text-[#5f6f82]">
                      Payment: {paymentStatusLabel[order.paymentStatus] ?? String(order.paymentStatus)} · {getPaymentTypeLabel(order.paymentType)}
                    </div>
                  </div>
                  <div className="rounded-full bg-[#f6fbff] px-4 py-2 text-sm font-semibold text-[#0f79ab]">
                    Total Pesanan: {formatMoney(order.grandTotal, order.currency)}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl border border-[#e6e9ee] bg-[#f9fafb] p-4">
                    <p className="text-sm text-[#6f8196]">Order ID</p>
                    <p className="mt-2 text-lg font-semibold text-[#203247]">{order.id}</p>
                  </div>
                  <div className="rounded-3xl border border-[#e6e9ee] bg-[#f9fafb] p-4">
                    <p className="text-sm text-[#6f8196]">Tanggal</p>
                    <p className="mt-2 text-lg font-semibold text-[#203247]">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="rounded-3xl border border-[#e6e9ee] bg-[#f9fafb] p-4">
                    <p className="text-sm text-[#6f8196]">Status</p>
                    <p className="mt-2 text-lg font-semibold text-[#203247]">{activeStatus.label}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#203247]">Informasi Batch</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-[#e6e9ee] bg-[#f9fafb] p-4">
                    <p className="text-sm text-[#6f8196]">Batch</p>
                    <p className="mt-2 text-base font-semibold text-[#203247]">HARF ONE</p>
                  </div>
                  <div className="rounded-3xl border border-[#e6e9ee] bg-[#f9fafb] p-4">
                    <p className="text-sm text-[#6f8196]">Periode</p>
                    <p className="mt-2 text-base font-semibold text-[#203247]">
                      {formatDate(batchStart.toISOString())} - {formatDate(batchEnd.toISOString())}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-[#e6e9ee] bg-[#f9fafb] p-4">
                    <p className="text-sm text-[#6f8196]">Estimasi Tiba</p>
                    <p className="mt-2 text-base font-semibold text-[#203247]">{formatDate(batchEstimated.toISOString())}</p>
                  </div>
                  <div className="rounded-3xl border border-[#e6e9ee] bg-[#f9fafb] p-4">
                    <p className="text-sm text-[#6f8196]">Status Batch</p>
                    <p className="mt-2 text-base font-semibold text-[#203247]">{batchStatus}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#203247]">Produk yang Dipesan</h2>
                <div className="mt-5 space-y-4">
                  {order.items.map((item) => (
                    <div key={item.product.id} className="grid gap-4 md:grid-cols-[88px_minmax(0,1fr)] items-start rounded-3xl border border-[#e6e9ee] p-4">
                      <div className="h-20 w-20 overflow-hidden rounded-3xl bg-[#f0f4fb]">
                        {item.product.image ? (
                          <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full place-items-center text-sm text-[#6f8196]">No image</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h3 className="text-base font-semibold text-[#203247]">{item.product.name}</h3>
                          <span className="text-sm text-[#6f8196]">Qty: {item.qty}</span>
                        </div>
                        <p className="text-sm text-[#6f8196]">Variant: {item.product.coupleGender ? item.product.coupleGender : "Standar"}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-[#203247]">
                          <span>Price: {formatMoney(item.product.price, order.currency)}</span>
                          <span className="font-semibold">Subtotal: {formatMoney(item.product.price * item.qty, order.currency)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#203247]">Informasi Pembayaran</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-[#e6e9ee] bg-[#f9fafb] p-4">
                    <p className="text-sm text-[#6f8196]">Payment Type</p>
                    <p className="mt-2 text-base font-semibold text-[#203247]">{paymentTypeLabel[order.paymentType]}</p>
                  </div>
                  <div className="rounded-3xl border border-[#e6e9ee] bg-[#f9fafb] p-4">
                    <p className="text-sm text-[#6f8196]">Status</p>
                    <p className="mt-2 text-base font-semibold text-[#203247]">{paymentStatusLabel[order.paymentStatus]}</p>
                  </div>
                  <div className="rounded-3xl border border-[#e6e9ee] bg-[#f9fafb] p-4">
                    <p className="text-sm text-[#6f8196]">Total</p>
                    <p className="mt-2 text-base font-semibold text-[#203247]">{formatMoney(order.grandTotal, order.currency)}</p>
                  </div>
                  <div className="rounded-3xl border border-[#e6e9ee] bg-[#f9fafb] p-4">
                    <p className="text-sm text-[#6f8196]">Paid</p>
                    <p className="mt-2 text-base font-semibold text-[#203247]">{formatMoney(order.amountPaid, order.currency)}</p>
                  </div>
                  <div className="rounded-3xl border border-[#e6e9ee] bg-[#f9fafb] p-4 sm:col-span-2">
                    <p className="text-sm text-[#6f8196]">Remaining</p>
                    <p className="mt-2 text-base font-semibold text-[#203247]">{formatMoney(order.remainingAmount, order.currency)}</p>
                  </div>
                  {order.paymentType === "dp" && (
                    <div className="rounded-3xl border border-[#e6e9ee] bg-[#f9fafb] p-4 sm:col-span-2">
                      <p className="text-sm text-[#6f8196]">DP Rate</p>
                      <p className="mt-2 text-base font-semibold text-[#203247]">{dpRate}%</p>
                    </div>
                  )}
                </div>
                <div className="mt-5 space-y-3 text-sm text-[#5f6f82]">
                  <p>Jika status pesanan masih To Pay, unggah bukti pembayaran untuk diverifikasi oleh admin.</p>
                  {order.paymentProofName && <p>Bukti saat ini: <strong>{order.paymentProofName}</strong></p>}
                </div>
              </div>

            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#203247]">Informasi Pengiriman</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-[#e6e9ee] bg-[#f9fafb] p-4">
                    <p className="text-sm text-[#6f8196]">Metode</p>
                    <p className="mt-2 text-base font-semibold text-[#203247]">{getShippingMethodLabel(order.shipping_method)}</p>
                  </div>
                  <div className="rounded-3xl border border-[#e6e9ee] bg-[#f9fafb] p-4">
                    <p className="text-sm text-[#6f8196]">Status</p>
                    <p className="mt-2 text-base font-semibold text-[#203247]">{order.shipment_status === "arrived_indonesia" ? "Arrived at Indonesia Warehouse" : "Waiting for Arrival"}</p>
                  </div>
                  {order.shipping_method === "lion_parcel" && (
                    <>
                      <div className="rounded-3xl border border-[#e6e9ee] bg-[#f9fafb] p-4">
                        <p className="text-sm text-[#6f8196]">Courier</p>
                        <p className="mt-2 text-base font-semibold text-[#203247]">Lion Parcel</p>
                      </div>
                      <div className="rounded-3xl border border-[#e6e9ee] bg-[#f9fafb] p-4">
                        <p className="text-sm text-[#6f8196]">Tracking</p>
                        <p className="mt-2 text-base font-semibold text-[#203247]">{order.external_order_id || "LP123456789"}</p>
                      </div>
                    </>
                  )}
                </div>
                {order.shipping_method !== "lion_parcel" && (
                  <div className="mt-4 rounded-3xl border border-[#e6e9ee] bg-[#f8fcff] p-4 text-sm text-[#375a74]">
                    Link checkout akan dikirim oleh admin setelah barang tiba di Indonesia.
                  </div>
                )}
                {order.external_checkout_link && (order.shipping_method === "shopee" || order.shipping_method === "tiktok") && (
                  <div className="mt-4">
                    <Link
                      href={order.external_checkout_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-full bg-[#16a7be] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1096ad]"
                    >
                      Checkout via {order.shipping_method === "shopee" ? "Shopee" : "TikTok Shop"}
                    </Link>
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#203247]">Timeline Order</h2>
                <div className="mt-6 space-y-4">
                  {timeline.map((event) => (
                    <div key={event.title} className="flex items-start gap-4">
                      <div className={`mt-1 h-3 w-3 rounded-full ${event.active ? "bg-[#0f9ab4]" : "bg-[#d5dce4]"}`} />
                      <div>
                        <p className="text-sm font-semibold text-[#203247]">{event.title}</p>
                        {event.date ? (
                          <p className="text-sm text-[#6f8196]">{event.date}</p>
                        ) : (
                          <p className="text-sm text-[#6f8196]">Menunggu langkah selanjutnya</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#203247]">Ringkasan Pesanan</h2>
                <div className="mt-5 space-y-3 text-sm text-[#5f6f82]">
                  <p>Jumlah produk: <strong className="text-[#203247]">{order.itemCount}</strong></p>
                  <p>Metode pembayaran: <strong className="text-[#203247]">{paymentTypeLabel[order.paymentType]}</strong></p>
                  <p>Status pembayaran: <strong className="text-[#203247]">{paymentStatusLabel[order.paymentStatus]}</strong></p>
                  <p>Alamat pengiriman: <strong className="text-[#203247]">{order.customerAddress}</strong></p>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#203247]">Aksi</h2>
                <div className="mt-5 space-y-3">
                  {order.status === "to_pay" && (
                    <>
                      <button
                        type="button"
                        onClick={handleProofUploadClick}
                        className="inline-flex w-full justify-center rounded-full bg-[#16a7be] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1096ad]"
                      >
                        Upload Bukti Pembayaran
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelOrder}
                        className="inline-flex w-full justify-center rounded-full border border-[#e6e9ee] bg-white px-4 py-3 text-sm font-semibold text-[#203247] hover:bg-[#f7fafc]"
                      >
                        Batalkan Pesanan
                      </button>
                    </>
                  )}

                  {order.status === "waiting_settlement" && order.shipping_method === "lion_parcel" && order.paymentType === "dp" && (
                    <Link
                      href={`/checkout?settlementOrderId=${encodeURIComponent(order.id)}`}
                      className="inline-flex w-full justify-center rounded-full bg-[#16a7be] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1096ad]"
                    >
                      Bayar Pelunasan
                    </Link>
                  )}

                  {order.status === "waiting_settlement" && order.external_checkout_link && (
                    <Link
                      href={order.external_checkout_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full justify-center rounded-full bg-[#16a7be] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1096ad]"
                    >
                      Checkout via {order.shipping_method === "shopee" ? "Shopee" : "TikTok Shop"}
                    </Link>
                  )}

                  {order.status === "to_receive" && (
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-full bg-[#fff7d9] px-4 py-3 text-sm font-semibold text-[#9b6b01] hover:bg-[#fff5c3]"
                    >
                      Lacak Paket
                    </button>
                  )}

                  {order.status === "completed" && (
                    <Link
                      href="/shop"
                      className="inline-flex w-full justify-center rounded-full bg-[#16a7be] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1096ad]"
                    >
                      Beli Lagi
                    </Link>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={handleProofFile}
        />
      </RequireAuth>
    </SiteShell>
  );
}
