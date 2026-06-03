"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import { formatCurrency } from "@/lib/format";
import { useApp } from "@/lib/store";
import type { CurrencyCode, Order, PaymentMethod, PaymentPlan, Product } from "@/lib/types";

const formatCountdown = (deadline?: string) => {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "Pre-order closed";
  const day = 24 * 60 * 60 * 1000;
  const days = Math.ceil(diff / day);
  return `Pre-order closes in ${days} day${days > 1 ? "s" : ""}`;
};

const isValidPhone = (phone: string) => /^\d{8,15}$/.test(phone.trim());

const getArrivalEstimate = (product: Product) => {
  if (product.status !== "preorder") return null;
  return "Estimasi datang: 2-3 minggu dari Thailand";
};

const DP_PERCENT = 0.3;

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const settlementOrderId = searchParams.get("settlementOrderId");
  const { user, cart, orders, cartTotal, profileComplete, isReady, placeOrder, updateOrder, settings } = useApp();
  const [selectedMethodId, setSelectedMethodId] = useState("bt_bca");
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<PaymentPlan>("full");
  const currency: CurrencyCode = "IDR";
  const [paymentProofName, setPaymentProofName] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [shippingService, setShippingService] = useState<"regular" | "express">("regular");
  const [shippingMethod, setShippingMethod] = useState<"lion_parcel" | "shopee" | "tiktok">("lion_parcel");
  const [showAllMethods, setShowAllMethods] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const settlementOrder = settlementOrderId ? orders.find((order) => order.id === settlementOrderId) ?? null : null;
  const isSettlementMode = Boolean(settlementOrder);

  const shippingCatalog = {
    regular: { label: "Reguler", eta: "Estimasi tiba 3 - 5 hari", cost: 18000 },
    express: { label: "Express", eta: "Estimasi tiba 1 - 2 hari", cost: 35000 }
  } as const;
  const shippingCost = shippingCatalog[shippingService].cost;
  const effectiveShippingCost = shippingMethod === "lion_parcel" ? shippingCost : 0;
  const settlementRemainingAmount = settlementOrder?.remainingAmount ?? 0;

  const exchangeRates: Record<CurrencyCode, number> = {
    IDR: 1,
    USD: 16000,
    JPY: 110
  };

  const methodGroups: { title: string; methods: PaymentMethod[] }[] = [
    {
      title: "Metode Pembayaran",
      methods: [
        { id: "bt_bca", name: "Transfer Bank BCA", type: "bank_transfer", autoConfirm: false, requiresProof: true },
        { id: "qris", name: "QRIS", type: "qris", autoConfirm: false, requiresProof: true }
      ]
    }
  ];

  const defaultGroups = methodGroups;
  const renderedGroups = showAllMethods ? methodGroups : defaultGroups;
  const paymentMethods = methodGroups.flatMap((group) => group.methods);
  const selectedMethod = paymentMethods.find((method) => method.id === selectedMethodId) ?? paymentMethods[0];

  const baseGrandTotal = isSettlementMode ? settlementRemainingAmount : cartTotal + effectiveShippingCost;
  const dpAmount = Math.round(baseGrandTotal * DP_PERCENT);
  const hasClosedItems = !isSettlementMode && cart.some((item) => item.product.status === "closed");
  const addressValid = Boolean(
    user?.profile.address?.trim() &&
    user.profile.city?.trim() &&
    user.profile.province?.trim() &&
    /^\d{5}$/.test(user.profile.postalCode.trim()) &&
    isValidPhone(user.profile.phone)
  );

  const formatPrice = (value: number, targetCurrency = currency) => {
    const rate = exchangeRates[targetCurrency];
    const converted = value / rate;
    return new Intl.NumberFormat(targetCurrency === "IDR" ? "id-ID" : "en-US", {
      style: "currency",
      currency: targetCurrency,
      maximumFractionDigits: targetCurrency === "IDR" ? 0 : 2
    }).format(converted);
  };

  const generateReference = (method: PaymentMethod) => {
    const suffix = Math.floor(100000 + Math.random() * 900000);
    if (method.type === "virtual_account") return `8801${suffix}${Math.floor(100 + Math.random() * 900)}`;
    if (method.type === "convenience_store") return `CS-${suffix}`;
    if (method.type === "qris") return `QRIS-${suffix}`;
    if (method.type === "bank_transfer") {
      if (method.id === "bt_bca") return `BCA-${suffix}`;
      return `TRF-${suffix}`;
    }
    if (method.type === "international") return `PAY-${suffix}`;
    return `PM-${suffix}`;
  };

  const paymentOutcome = useMemo(() => {
    const isAutoPaid = selectedMethod.autoConfirm && selectedMethod.type !== "qris" && selectedMethod.type !== "bank_transfer";
    const shouldMarkPaidNow = isAutoPaid;

    if (!shouldMarkPaidNow) {
      return {
        paymentStatus: "to_pay" as Order["paymentStatus"],
        orderStatus: "to_pay" as Order["status"],
        amountPaid: 0,
        remainingAmount: baseGrandTotal
      };
    }

    if (selectedPaymentPlan === "dp") {
      return {
        paymentStatus: "dp_paid" as Order["paymentStatus"],
        orderStatus: "on_process" as Order["status"],
        amountPaid: dpAmount,
        remainingAmount: Math.max(0, baseGrandTotal - dpAmount)
      };
    }

    return {
      paymentStatus: "fully_paid" as Order["paymentStatus"],
      orderStatus: "on_process" as Order["status"],
      amountPaid: baseGrandTotal,
      remainingAmount: 0
    };
  }, [selectedMethod, selectedPaymentPlan, baseGrandTotal, dpAmount]);

  const canSubmit =
    (selectedMethod.requiresProof ? Boolean(paymentProofName) : true) &&
    !hasClosedItems &&
    addressValid;

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace("/auth");
      return;
    }
    if (!profileComplete) {
      router.replace("/profile");
      return;
    }
    if (!isSettlementMode && cart.length === 0 && !isSubmitting) {
      router.replace("/cart");
    }
  }, [isReady, user, profileComplete, cart.length, router, isSubmitting, isSettlementMode]);

  useEffect(() => {
    setPaymentProofName(null);
    setPaymentReference(generateReference(selectedMethod));
  }, [selectedMethodId]);

  const handlePlaceOrder = () => {
    if (!selectedMethod || !canSubmit) return;

    setIsSubmitting(true);

    if (isSettlementMode && settlementOrder) {
      updateOrder(settlementOrder.id, {
        status: "waiting_settlement",
        paymentStatus: "pending",
        settlementProofName: paymentProofName,
        paymentReference,
        paymentMethodId: selectedMethod.id,
        paymentMethod: selectedMethod.name,
        paymentChannel: selectedMethod.type,
        notes: "Pelunasan DP menunggu verifikasi admin"
      });

      router.push("/orders");
      return;
    }

    const finalOrderStatus = paymentOutcome.orderStatus;
    const finalPaymentStatus = paymentOutcome.paymentStatus;

    const order = placeOrder({
      paymentMethodId: selectedMethod.id,
      paymentMethod: selectedMethod.name,
      paymentType: selectedPaymentPlan,
      paymentChannel: selectedMethod.type,
      shippingCost: effectiveShippingCost,
      shipping_method: shippingMethod,
      external_checkout_link: null,
      external_order_id: null,
      notes:
        shippingMethod === "lion_parcel"
          ? null
          : `Metode: Checkout via ${shippingMethod === "shopee" ? "Shopee" : "TikTok"}. Link checkout akan dikirim oleh admin saat barang sudah sampai Indonesia.`,
      currency,
      exchangeRate: exchangeRates[currency],
      paymentReference,
      paymentStatus: finalPaymentStatus,
      paymentProofName,
      amountPaid: paymentOutcome.amountPaid,
      remainingAmount: paymentOutcome.remainingAmount,
      orderStatus: finalOrderStatus
    });

    if (!order) {
      setIsSubmitting(false);
      return;
    }

    router.push("/orders");
  };

  if (!isReady || !user || !profileComplete || (!isSettlementMode && cart.length === 0 && !isSubmitting)) {
    return (
      <SiteShell>
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-text">
          Preparing your checkout...
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="checkout-page">
        <h1>Checkout</h1>

        <div className="checkout-layout">
          <div className="checkout-left">
            <div className="checkout-card">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="checkout-label">ALAMAT PENGIRIMAN</p>
                <Link href="/profile" className="text-xs font-semibold text-sky hover:underline">
                  Ganti
                </Link>
              </div>
              <h2>Rumah - {user.profile.fullName || user.name}</h2>
              <p>
                {user.profile.address}, {user.profile.city}, {user.profile.province}, {user.profile.postalCode}
              </p>
              <p>{user.profile.phone}</p>
              {!addressValid && (
                <p className="mt-2 text-xs font-semibold text-rose-600">
                  Alamat/nomor HP belum valid. Lengkapi profile dulu sebelum checkout.
                </p>
              )}
            </div>

            <div className="checkout-card">
              <h2 className="checkout-store-title">SABAI MERCH</h2>
              {isSettlementMode ? (
                <div className="rounded-2xl border border-ink/10 bg-white p-4">
                  <p className="text-sm font-semibold text-ink">Pelunasan DP</p>
                  <p className="mt-1 text-sm text-text">Order {settlementOrder?.id}</p>
                  <p className="mt-1 text-sm text-text">Status sekarang: {settlementOrder?.status}</p>
                  <p className="mt-1 text-sm text-text">Sisa pembayaran: {formatCurrency(settlementRemainingAmount)}</p>
                </div>
              ) : cart.map((item) => {
                const preOrderCountdown = formatCountdown(item.product.deadline);
                const arrivalEstimate = getArrivalEstimate(item.product);

                return (
                  <div key={item.product.id} className="checkout-item-row">
                    <div className="checkout-item-image">GO</div>
                    <div className="checkout-item-info">
                      <h3>{item.product.name}</h3>
                      <p>{item.product.description}</p>
                      {item.product.status === "preorder" && (
                        <div className="mt-1 text-xs text-[#7b5d1c]">
                          {arrivalEstimate}
                          {preOrderCountdown ? ` · ${preOrderCountdown}` : ""}
                        </div>
                      )}
                      {item.product.status === "closed" && (
                        <div className="mt-1 text-xs font-semibold text-rose-600">
                          Item ini sudah ditutup dan tidak bisa diproses checkout.
                        </div>
                      )}
                    </div>
                    <strong>{item.qty}x {formatCurrency(item.product.price)}</strong>
                  </div>
                );
              })}

              <div className="checkout-option-box">
                <div className="w-full">
                  <label className="mb-1 block text-xs font-semibold text-ink">Pilih Metode Pengiriman</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <label className={`rounded-lg border px-3 py-2 text-sm ${shippingMethod === 'lion_parcel' ? 'border-sky bg-sky/10 text-sky' : 'border-ink/15'}`}>
                      <input type="radio" name="shippingMethod" checked={shippingMethod === 'lion_parcel'} onChange={() => setShippingMethod('lion_parcel')} /> Lion Parcel
                    </label>
                    <label className={`rounded-lg border px-3 py-2 text-sm ${shippingMethod === 'shopee' ? 'border-sky bg-sky/10 text-sky' : 'border-ink/15'}`}>
                      <input type="radio" name="shippingMethod" checked={shippingMethod === 'shopee'} onChange={() => setShippingMethod('shopee')} /> Checkout via Shopee
                    </label>
                    <label className={`rounded-lg border px-3 py-2 text-sm ${shippingMethod === 'tiktok' ? 'border-sky bg-sky/10 text-sky' : 'border-ink/15'}`}>
                      <input type="radio" name="shippingMethod" checked={shippingMethod === 'tiktok'} onChange={() => setShippingMethod('tiktok')} /> Checkout via TikTok
                    </label>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  {shippingMethod === 'lion_parcel' ? (
                    <>
                      <div>{shippingCatalog[shippingService].eta}</div>
                      <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.5rem" }}>📦 Dikirim dari: {settings.warehouseLocation || "Warehouse"}</div>
                    </>
                  ) : (
                    <div style={{ fontSize: "0.875rem", color: "#444" }}>
                      <div>Metode: Checkout via {shippingMethod === 'shopee' ? 'Shopee' : 'TikTok'}</div>
                      <div>Ongkir akan mengikuti sistem {shippingMethod === 'shopee' ? 'Shopee' : 'TikTok'}.</div>
                      <div>Link checkout akan dikirim oleh admin.</div>
                    <div>Pelunasan dan checkout Shopee/TikTok akan dibuka setelah barang tiba di Indonesia.</div>
                      <div style={{ fontSize: "0.8rem", color: "#666" }}>*Link dikirim ketika barang sudah sampai Indonesia.</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="checkout-note-row">
                <span>Catatan pembeli (opsional)</span>
                <span>Maks 200 karakter</span>
              </div>
            </div>
          </div>

          <aside className="checkout-right">
            <div className="checkout-card sticky">
              <div className="checkout-pay-header">
                <h2>Metode Pembayaran</h2>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowAllMethods((prev) => !prev)}
                >
                  {showAllMethods ? "Sembunyikan" : "Lihat Semua"}
                </button>
              </div>

              {!isSettlementMode && (
                <div className="checkout-method-group">
                  <p>Skema Pembayaran</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentPlan("full")}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        selectedPaymentPlan === "full"
                          ? "border-sky bg-sky/10 text-sky"
                          : "border-ink/15 bg-white text-ink hover:border-sky/40"
                      }`}
                    >
                      Full Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentPlan("dp")}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        selectedPaymentPlan === "dp"
                          ? "border-sky bg-sky/10 text-sky"
                          : "border-ink/15 bg-white text-ink hover:border-sky/40"
                      }`}
                    >
                      DP 30%
                    </button>
                  </div>
                </div>
              )}

              <div className="checkout-method-list">
                {renderedGroups.map((group) => (
                  <div key={group.title} className="checkout-method-group">
                    <p>{group.title}</p>
                    {group.methods.map((method) => (
                      <label key={method.id} className="checkout-method-row">
                        <span>{method.name}</span>
                        <input
                          type="radio"
                          name="payment"
                          checked={selectedMethodId === method.id}
                          onChange={() => setSelectedMethodId(method.id)}
                        />
                      </label>
                    ))}
                  </div>
                ))}
              </div>

              <div className="checkout-payment-detail">
                <h3>{selectedMethod.name}</h3>
                <p className="checkout-payment-subtext">Ref: {paymentReference}</p>

                {selectedMethod.type === "bank_transfer" && (
                  <>
                    <div className="checkout-payment-info">
                      <div>
                        <strong>No. Rekening:</strong> 2760246959
                      </div>
                      <div className="mt-1">
                        <strong>Atas Nama:</strong> ELIANA HERBELATARI
                      </div>
                    </div>
                    <label className="checkout-upload-proof">
                      Upload Bukti Pembayaran
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          setPaymentProofName(file ? file.name : null);
                        }}
                      />
                    </label>
                    <p className="checkout-payment-subtext">
                      {paymentProofName ? `File: ${paymentProofName}` : "Silakan upload bukti pembayaran."}
                    </p>
                  </>
                )}

                {selectedMethod.type === "qris" && (
                  <div className="checkout-qris-box">
                    <strong>Scan QRIS</strong>
                    <span>Gunakan GoPay, OVO, DANA, atau mobile banking</span>
                    <div style={{ margin: "1rem 0" }}>
                      <img 
                        src="/img/qris.png" 
                        alt="QRIS Code" 
                        style={{ 
                          maxWidth: "200px", 
                          width: "100%",
                          border: "1px solid #ddd",
                          borderRadius: "8px"
                        }} 
                      />
                    </div>
                    <label className="checkout-upload-proof">
                      Upload Bukti Pembayaran
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          setPaymentProofName(file ? file.name : null);
                        }}
                      />
                    </label>
                    <p className="checkout-payment-subtext">
                      {paymentProofName ? `File: ${paymentProofName}` : "Silakan upload bukti pembayaran."}
                    </p>
                  </div>
                )}
              </div>

              <div className="checkout-summary-block">
                <h3>Cek ringkasan transaksimu</h3>
                <div className="checkout-summary-row">
                  <span>{isSettlementMode ? "Sisa Pelunasan" : `Total Harga (${cart.length} Barang)`}</span>
                  <strong>{formatPrice(isSettlementMode ? settlementRemainingAmount : cartTotal)}</strong>
                </div>
                {!isSettlementMode && (
                  <>
                    <div className="checkout-summary-row">
                      <span>Total Ongkos Kirim</span>
                      <strong>{formatPrice(shippingCost)}</strong>
                    </div>
                    <div className="checkout-summary-row total">
                      <span>Total Tagihan</span>
                      <strong>{formatPrice(baseGrandTotal)}</strong>
                    </div>
                    <div className="checkout-summary-row">
                      <span>Plan</span>
                      <strong>{selectedPaymentPlan === "dp" ? "DP 30%" : "Full Payment"}</strong>
                    </div>
                    <div className="checkout-summary-row">
                      <span>Amount Paid</span>
                      <strong>{formatPrice(paymentOutcome.amountPaid)}</strong>
                    </div>
                    <div className="checkout-summary-row">
                      <span>Remaining</span>
                      <strong>{formatPrice(paymentOutcome.remainingAmount)}</strong>
                    </div>
                  </>
                )}
              </div>

              {hasClosedItems && (
                <p className="mt-3 text-xs font-semibold text-rose-600">
                  Ada item CLOSED di cart. Hapus dulu item tersebut untuk melanjutkan checkout.
                </p>
              )}

              <button className="cart-buy-btn" type="button" onClick={handlePlaceOrder} disabled={!canSubmit}>
                {isSettlementMode ? "Lunasi Sekarang" : "Bayar Sekarang"}
              </button>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
