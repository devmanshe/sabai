"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AppToast from "@/components/AppToast";
import { useApp } from "@/lib/store";
import type { Order } from "@/lib/types";

type AdminOrderStage = "pending" | "paid" | "shipped" | "cancelled";

const mapOrderToStage = (order: Order): AdminOrderStage => {
  if (order.status === "cancelled" || order.paymentStatus === "failed" || order.paymentStatus === "refunded") {
    return "cancelled";
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

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = decodeURIComponent(params.id);
  const { orders, updateOrder } = useApp();
  const [actionLoading, setActionLoading] = useState<"paid" | "ready" | "shipped" | "cancelled" | "external" | null>(null);
  const [externalCheckoutLink, setExternalCheckoutLink] = useState("");
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  const order = useMemo(() => orders.find((entry) => entry.id === orderId) ?? null, [orders, orderId]);
  const stage = order ? mapOrderToStage(order) : null;
  const paidButtonLabel = order.status === "waiting_settlement" ? "Approve Settlement" : "Mark as Paid";

  if (!order) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Order Not Found</h1>
        <Link href="/admin/orders" className="btn-ghost inline-block">
          Back to Orders
        </Link>
      </section>
    );
  }

  const runAction = async (nextAction: "paid" | "ready" | "shipped" | "cancelled" | "external") => {
    if (!stage) return;

    const canMarkPaid = (stage === "pending" || order.status === "waiting_settlement") && nextAction === "paid";
    const canMarkReady = stage === "paid" && nextAction === "ready" && order.status === "on_process";
    const canMarkShipped =
      stage === "paid" &&
      nextAction === "shipped" &&
      order.paymentStatus === "fully_paid" &&
      order.remainingAmount <= 0;
    const canCancel = stage === "pending" && nextAction === "cancelled";
    const canSendExternal = nextAction === "external" && order.status === "ready" && externalCheckoutLink.trim();

    if (!canMarkPaid && !canMarkReady && !canMarkShipped && !canCancel && !canSendExternal) {
      setToast({ message: "Transisi status tidak valid atau link belum diisi.", variant: "error" });
      return;
    }

    setActionLoading(nextAction);

    if (nextAction === "external" && canSendExternal) {
      updateOrder(order.id, {
        external_checkout_link: externalCheckoutLink.trim(),
        status: "to_ship",
        shipment_status: "arrived_indonesia"
      });
      setExternalCheckoutLink("");
    }

    if (nextAction === "ready" && canMarkReady) {
      updateOrder(order.id, {
        status: "ready",
        shipment_status: "arrived_indonesia"
      });
    }

    if (nextAction === "paid") {
      if (order.status === "waiting_settlement") {
        updateOrder(order.id, {
          paymentStatus: "fully_paid",
          amountPaid: order.baseGrandTotal,
          remainingAmount: 0,
          status: "to_ship",
          settlementProofName: order.settlementProofName ?? order.paymentProofName
        });
      } else {
        updateOrder(order.id, {
          paymentStatus: order.paymentType === "dp" ? "dp_paid" : "fully_paid",
          amountPaid: order.paymentType === "dp" ? Math.max(order.amountPaid, Math.round(order.baseGrandTotal * 0.3)) : order.baseGrandTotal,
          remainingAmount: order.paymentType === "dp" ? Math.max(0, order.baseGrandTotal - Math.max(order.amountPaid, Math.round(order.baseGrandTotal * 0.3))) : 0,
          status: "on_process"
        });
      }
    }

    if (nextAction === "shipped") {
      updateOrder(order.id, {
        status: "to_ship",
        paymentStatus: "fully_paid",
        amountPaid: order.baseGrandTotal,
        remainingAmount: 0
      });
    }

    if (nextAction === "cancelled") {
      updateOrder(order.id, {
        status: "cancelled",
        paymentStatus:
          order.paymentStatus === "fully_paid" || order.paymentStatus === "dp_paid"
            ? "refunded"
            : "failed"
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    setActionLoading(null);
    setToast({ message: "Order updated successfully", variant: "success" });
  };

  return (
    <section className="space-y-5">
      <AppToast
        open={Boolean(toast)}
        variant={toast?.variant ?? "info"}
        title={toast?.variant === "error" ? "Aksi Gagal" : "Aksi Berhasil"}
        message={toast?.message ?? ""}
        onClose={() => setToast(null)}
        autoHideMs={2600}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Order Detail</h1>
          <p className="text-sm text-text">{order.id} · {new Date(order.createdAt).toLocaleString("id-ID")}</p>
        </div>
        <Link href="/admin/orders" className="btn-ghost inline-block">
          Back to Orders
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <div className="soft-panel p-5">
            <h2 className="text-lg font-semibold">User Info</h2>
            <div className="mt-3 space-y-2 text-sm text-text">
              <p><strong className="text-ink">Nama:</strong> {order.customerName}</p>
              <p><strong className="text-ink">No Telp:</strong> {order.customerPhone}</p>
              <p><strong className="text-ink">Alamat:</strong> {order.customerAddress}</p>
            </div>
          </div>

          <div className="soft-panel p-5">
            <h2 className="text-lg font-semibold">Items</h2>
            <div className="mt-3 space-y-3">
              {order.items.map((item) => (
                <div key={item.product.id} className="rounded-xl border border-ink/10 bg-white px-3 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-ink">{item.product.name}</strong>
                    <span className="text-text">Qty {item.qty}</span>
                  </div>
                  <p className="mt-1 text-text">{item.product.description}</p>
                  <p className="mt-1 font-semibold text-ink">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0
                    }).format(item.product.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="soft-panel p-5">
            <h2 className="text-lg font-semibold">Payment Info</h2>
            <div className="mt-3 space-y-2 text-sm text-text">
              <p><strong className="text-ink">Metode:</strong> {order.paymentMethod}</p>
              <p><strong className="text-ink">Payment Plan:</strong> {order.paymentType.toUpperCase()}</p>
              <p><strong className="text-ink">Payment Channel:</strong> {order.paymentChannel}</p>
              <p><strong className="text-ink">Reference:</strong> {order.paymentReference}</p>
              <p><strong className="text-ink">Payment Status:</strong> {order.paymentStatus}</p>
              <p><strong className="text-ink">Order Status:</strong> {order.status}</p>
              <p><strong className="text-ink">Shipment Status:</strong> {order.shipment_status || "on_going"}</p>
              {order.shipping_method && order.shipping_method !== "lion_parcel" && (
                <>
                  <p><strong className="text-ink">Shipping Method:</strong> {order.shipping_method.toUpperCase()}</p>
                  {order.external_checkout_link && (
                    <p><strong className="text-ink">Checkout Link:</strong> <a href={(order as any).external_checkout_link} target="_blank" rel="noopener noreferrer" className="text-sky hover:underline">{(order as any).external_checkout_link}</a></p>
                  )}
                </>
              )}
              <p><strong className="text-ink">Amount Paid:</strong> {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0
              }).format(order.amountPaid)}</p>
              <p><strong className="text-ink">Remaining:</strong> {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0
              }).format(order.remainingAmount)}</p>
              <p><strong className="text-ink">Bukti Transfer:</strong> {order.paymentProofName || "Tidak ada"}</p>
              {order.settlementProofName && <p><strong className="text-ink">Bukti Pelunasan:</strong> {order.settlementProofName}</p>}
              <p><strong className="text-ink">Total:</strong> {formatMoney(order)}</p>
              {(order as any).notes && <p><strong className="text-ink">Notes:</strong> {(order as any).notes}</p>}
            </div>
          </div>

          <div className="soft-panel p-5">
            <h2 className="text-lg font-semibold">Action Admin</h2>
            <p className="mt-1 text-xs text-text">Rule: To Pay → Paid → On Process → Ready → To Ship. DP menunggu pelunasan saat status Ready.</p>
            {order.status === "ready" && order.paymentType === "dp" && order.remainingAmount > 0 && <p className="mt-1 text-xs text-yellow-700">⚠️ Order sudah ready. Pelunasan akan dibuka ke user.</p>}
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                className="btn-primary"
                disabled={actionLoading !== null || stage !== "pending"}
                onClick={() => runAction("paid")}
              >
                {actionLoading === "paid" ? "Updating..." : paidButtonLabel}
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={actionLoading !== null || stage !== "paid" || order.status !== "on_process"}
                onClick={() => runAction("ready")}
              >
                {actionLoading === "ready" ? "Updating..." : "Barang Sudah Tiba di Indonesia"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={actionLoading !== null || stage !== "paid" || order.paymentStatus !== "fully_paid" || order.remainingAmount > 0}
                onClick={() => runAction("shipped")}
              >
                {actionLoading === "shipped" ? "Updating..." : "Mark as Shipped"}
              </button>
              <button
                type="button"
                className="btn-ghost"
                disabled={actionLoading !== null || stage !== "pending"}
                onClick={() => runAction("cancelled")}
              >
                {actionLoading === "cancelled" ? "Updating..." : "Cancel Order"}
              </button>
            </div>
          </div>

          {order.status === "ready" && order.shipping_method && order.shipping_method !== "lion_parcel" && (
            <div className="soft-panel p-5">
              <h2 className="text-lg font-semibold">External Checkout ({order.shipping_method?.toUpperCase() || "N/A"})</h2>
              <p className="mt-1 text-xs text-text">Kirim link checkout ke customer setelah barang tiba di Indonesia.</p>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-ink">Link {order.shipping_method === "shopee" ? "Shopee" : "TikTok"}</label>
                  <input
                    type="text"
                    placeholder={order.shipping_method === "shopee" ? "https://shopee.co.id/..." : "https://vt.tiktok.com/..."}
                    value={externalCheckoutLink}
                    onChange={(e) => setExternalCheckoutLink(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-ink/20 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  className="btn-primary w-full"
                  disabled={actionLoading !== null || !externalCheckoutLink.trim()}
                  onClick={() => runAction("external")}
                >
                  {actionLoading === "external" ? "Sending..." : `Send Link & Mark To Ship`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
