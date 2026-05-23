"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import StatusBadge from "@/components/StatusBadge";
import CTASection from "@/components/CTASection";
import { categoryLabels, products } from "@/lib/data";
import { formatCurrency } from "@/lib/format";
import { useApp } from "@/lib/store";
import AppToast from "@/components/AppToast";

const tabItems = ["Description", "Shipping Info", "Terms"] as const;

const formatNumber = (value: number) => new Intl.NumberFormat("id-ID").format(value);

const getTimeLeft = (deadline?: string) => {
  if (!deadline) return null;

  const diff = new Date(deadline).getTime() - Date.now();
  if (Number.isNaN(diff)) return null;
  if (diff <= 0) return "Pre-order closed";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

  if (days > 0) {
    return `Pre-order closes in ${days} day${days === 1 ? "" : "s"} ${hours} hour${hours === 1 ? "" : "s"}`;
  }

  return `Pre-order closes in ${hours} hour${hours === 1 ? "" : "s"}`;
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const routeParams = useParams<{ id: string }>();
  const { user, addToCart, profileComplete } = useApp();
  const [toastOpen, setToastOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<(typeof tabItems)[number]>("Description");
  const [previewOpen, setPreviewOpen] = useState(false);
  const productId = routeParams.id ?? params.id;
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return (
      <SiteShell>
        <div className="surface-card p-8 text-center">
          <h1 className="text-2xl font-semibold">Product not found</h1>
          <p className="mt-2 text-sm text-text">Try another GO item from the shop.</p>
          <Link href="/shop" className="btn-primary mt-4 inline-flex">
            Back to shop
          </Link>
        </div>
      </SiteShell>
    );
  }

  const isClosed = product.status === "closed";
  const isPreorder = product.status === "preorder";
  const stockLabel =
    product.status === "instock"
      ? product.stock > 10
        ? "Ready stock"
        : `Low stock: only ${product.stock} left`
      : product.status === "preorder"
        ? `Pre-order quota: ${formatNumber(product.stock)} slots`
        : "Group Order Closed";
  const ratingText = useMemo(() => {
    if (typeof product.rating !== "number") return null;
    const reviews = typeof product.reviews === "number" ? product.reviews : null;
    const reviewLabel = reviews === null ? "Reviews" : `${reviews >= 1000 ? `${(reviews / 1000).toFixed(reviews % 1000 === 0 ? 0 : 1)}k` : reviews} Reviews`;
    return `${product.rating.toFixed(1)} (${reviewLabel})`;
  }, [product.rating, product.reviews]);

  const relatedProducts = useMemo(
    () =>
      products
        .filter((item) => item.id !== product.id)
        .filter((item) => item.category === product.category || item.agencyId === product.agencyId)
        .slice(0, 3),
    [product.agencyId, product.category, product.id]
  );

  const deadlineText = useMemo(() => getTimeLeft(product.deadline), [product.deadline]);

  useEffect(() => {
    setQuantity(1);
    setActiveTab("Description");
  }, [product.id]);

  useEffect(() => {
    if (!previewOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [previewOpen]);

  const handleAdd = () => {
    if (isClosed) return;
    if (!user) {
      router.push(`/auth?intent=cart&productId=${encodeURIComponent(product.id)}`);
      return;
    }
    const added = addToCart(product, quantity);
    if (added) setToastOpen(true);
  };

  const handleBuy = () => {
    if (isClosed) return;
    if (!user) {
      router.push(`/auth?intent=buy&productId=${encodeURIComponent(product.id)}`);
      return;
    }
    if (!profileComplete) {
      router.push("/profile");
      return;
    }
    addToCart(product, quantity);
    router.push("/checkout");
  };

  return (
    <SiteShell>
      <AppToast
        open={toastOpen}
        variant="success"
        title="Added to cart"
        message={`${product.name} sudah masuk keranjang.`}
        onClose={() => setToastOpen(false)}
        autoHideMs={1800}
      />
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-[32px] bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.24)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text">Preview</p>
                <h2 className="text-2xl font-semibold text-ink">{product.name}</h2>
              </div>
              <button type="button" className="btn-ghost" onClick={() => setPreviewOpen(false)}>
                Close
              </button>
            </div>
            <div className="mt-6 flex h-[420px] items-center justify-center rounded-[28px] bg-gradient-to-br from-ice via-white to-fog">
              <Image src="/img/Logo%20w%20Text.png" alt={product.name} width={300} height={90} />
            </div>
          </div>
        </div>
      )}

      <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-4">
          <div className="surface-card overflow-hidden p-4 sm:p-6">
            <div className="flex items-center gap-3 text-sm text-text">
              <Link href="/" className="font-semibold hover:text-ink">Home</Link>
              <span>&gt;</span>
              <Link href="/shop" className="font-semibold hover:text-ink">Shop</Link>
              <span>&gt;</span>
              <span className="font-semibold text-ink">{categoryLabels[product.category]}</span>
              <span>&gt;</span>
              <span className="truncate font-semibold text-ink">{product.name}</span>
            </div>

            <button
              type="button"
              className="mt-4 w-full overflow-hidden rounded-[28px] bg-gradient-to-br from-ice via-white to-fog p-4 transition hover:-translate-y-0.5"
              onClick={() => setPreviewOpen(true)}
            >
              <div className="flex h-[420px] items-center justify-center rounded-[22px] bg-white/70 shadow-inner">
                <Image src="/img/Logo%20w%20Text.png" alt={product.name} width={320} height={96} />
              </div>
            </button>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  type="button"
                  className={`h-20 rounded-2xl border transition ${index === 0 ? "border-ink/25 bg-white" : "border-white bg-white/70 hover:border-ink/20"}`}
                  onClick={() => setPreviewOpen(true)}
                >
                  <div className="flex h-full items-center justify-center rounded-2xl bg-gradient-to-br from-ice via-white to-fog text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
                    Thumb {index + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-ink/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text">Urgency</p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {isPreorder ? deadlineText ?? "Closing soon" : product.status === "instock" ? "Available now" : "Closed"}
                </p>
              </div>
              <div className="rounded-2xl bg-ink/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text">Trust</p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {ratingText ?? "No reviews yet"}
                </p>
              </div>
              <div className="rounded-2xl bg-ink/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text">Product Facts</p>
                <p className="mt-2 text-sm font-semibold text-ink">{categoryLabels[product.category]} · {formatNumber(product.stock)} stock</p>
              </div>
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex gap-2 border-b border-ink/10 pb-3 text-sm font-semibold text-text">
              {tabItems.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 transition ${activeTab === tab ? "bg-ink text-white" : "bg-white hover:bg-ink/5"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-4 text-sm leading-7 text-text">
              {activeTab === "Description" && (
                <div className="space-y-3">
                  <p>{product.description}</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>Official Thailand merch / group order item.</li>
                    <li>Includes packaging details, note, and QC before ship.</li>
                    <li>Quantity selection is available before checkout.</li>
                  </ul>
                </div>
              )}
              {activeTab === "Shipping Info" && (
                <div className="space-y-3">
                  <p>Estimate arrival: 2-4 weeks after the drop closes.</p>
                  <p>Delay from Thailand is possible depending on warehouse and local courier handling.</p>
                  <p>Shipping updates will follow order status in your dashboard.</p>
                </div>
              )}
              {activeTab === "Terms" && (
                <div className="space-y-3">
                  <ul className="list-disc space-y-1 pl-5">
                    <li>No cancellation after order is confirmed.</li>
                    <li>Please complete your profile before using Buy Now.</li>
                    <li>Pre-order items close based on deadline shown above.</li>
                    <li>Closed products cannot be ordered anymore.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="surface-card p-6">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={product.status} />
              <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold text-ink/70">
                {categoryLabels[product.category]}
              </span>
              {product.coupleGender && (
                <span className="rounded-full bg-sky/10 px-3 py-1 text-xs font-semibold text-sky">
                  Gender: {product.coupleGender}
                </span>
              )}
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text">
                {product.category === "couple" ? "Couple Product" : "Official GO Product"}
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                {product.name}
              </h1>
              {ratingText && <p className="text-sm text-text">{ratingText}</p>}
              <p className="max-w-2xl text-sm leading-7 text-text">{product.description}</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl bg-ink/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text">Price</p>
                <p className="mt-1 text-2xl font-semibold text-ink">{formatCurrency(product.price)}</p>
              </div>
              <div className="rounded-2xl bg-ink/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text">Stock</p>
                <p className="mt-1 text-lg font-semibold text-ink">{stockLabel}</p>
              </div>
              <div className="rounded-2xl bg-ink/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text">Status</p>
                <p className="mt-1 text-lg font-semibold text-ink">
                  {product.status === "preorder"
                    ? "Pre-order"
                    : product.status === "instock"
                      ? "In Stock"
                      : "Closed"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-ink/10 bg-white p-5 shadow-[0_10px_30px_rgba(78,98,106,0.08)]">
              {isPreorder ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text">Pre-order Info</p>
                  <p className="text-lg font-semibold text-ink">{deadlineText ?? "Pre-order closes soon"}</p>
                  {product.deadline && (
                    <p className="text-sm text-text">Deadline: {new Date(product.deadline).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  )}
                </div>
              ) : product.status === "instock" ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text">Availability</p>
                  <p className="text-lg font-semibold text-ink">Ready stock</p>
                  <p className="text-sm text-text">{product.stock > 10 ? `${formatNumber(product.stock)} items available` : "Limited stock is left"}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text">Group Order</p>
                  <p className="text-lg font-semibold text-ink">Group Order Closed</p>
                  <p className="text-sm text-text">This item can no longer be ordered.</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[28px] bg-ink/5 p-4">
              <div className="flex items-center rounded-full border border-ink/10 bg-white px-3 py-2 shadow-sm">
                <button
                  type="button"
                  className="px-3 text-lg font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={isClosed}
                >
                  −
                </button>
                <span className="min-w-10 px-3 text-center text-lg font-semibold text-ink">{quantity}</span>
                <button
                  type="button"
                  className="px-3 text-lg font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => setQuantity((current) => current + 1)}
                  disabled={isClosed}
                >
                  +
                </button>
              </div>
              <p className="text-sm text-text">
                {isClosed ? "Product closed" : `Selected ${quantity} item${quantity > 1 ? "s" : ""}`}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="btn-primary min-w-40 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleBuy}
                disabled={isClosed}
              >
                Buy Now
              </button>
              <button
                className="btn-ghost min-w-40 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleAdd}
                disabled={isClosed}
              >
                Add to Cart
              </button>
              <Link href="/shop" className="btn-secondary min-w-40">
                Continue Shopping
              </Link>
            </div>

            {isClosed && (
              <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                Group Order Closed
              </div>
            )}
          </div>
        </aside>
      </section>

      <section className="mt-12 space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text">Related Posts</p>
            <h2 className="mt-2 text-3xl font-semibold text-ink">People also bought</h2>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-sky hover:text-ink">
            View all
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {relatedProducts.length === 0 ? (
            <div className="surface-card p-6 text-text md:col-span-3">No related products yet.</div>
          ) : (
            relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.id}`}
                className="surface-card group p-4 transition hover:-translate-y-1"
              >
                <div className="flex h-44 items-center justify-center rounded-[24px] bg-gradient-to-br from-ice via-white to-fog text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
                  {item.status === "closed" ? "Closed" : "New"}
                </div>
                <p className="mt-4 text-lg font-semibold text-ink group-hover:text-sky">{item.name}</p>
                <p className="mt-1 text-sm text-text">{formatCurrency(item.price)}</p>
              </Link>
            ))
          )}
        </div>
      </section>

      <div className="mt-12">
        <CTASection />
      </div>
    </SiteShell>
  );
}
