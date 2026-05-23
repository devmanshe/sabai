"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { categoryLabels } from "@/lib/data";
import StatusBadge from "./StatusBadge";
import AppToast from "./AppToast";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact }: ProductCardProps) {
  const router = useRouter();
  const { user, addToCart, categories, profileComplete } = useApp();
  const [toastOpen, setToastOpen] = useState(false);
  const isClosed = product.status === "closed";
  const imageHeight = compact ? "h-28" : "h-36";
  const agencyName = product.agencyId
    ? categories.find((entry) => entry.id === product.agencyId)?.name
    : null;
  const ratingText = useMemo(() => {
    if (typeof product.rating !== "number") return null;
    const reviews = typeof product.reviews === "number" ? product.reviews : null;
    const reviewLabel = reviews === null ? "Reviews" : `${reviews >= 1000 ? `${(reviews / 1000).toFixed(reviews % 1000 === 0 ? 0 : 1)}k` : reviews} Reviews`;
    return `${product.rating.toFixed(1)} (${reviewLabel})`;
  }, [product.rating, product.reviews]);

  const navigateToDetail = () => {
    router.push(`/product/${product.id}`);
  };

  const handleAdd = () => {
    if (isClosed) return;
    if (!user) {
      router.push(`/auth?intent=cart&productId=${encodeURIComponent(product.id)}`);
      return;
    }
    const added = addToCart(product, 1);
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
    addToCart(product, 1);
    router.push("/checkout");
  };

  return (
    <>
      <AppToast
        open={toastOpen}
        variant="success"
        title="Added to cart"
        message={`${product.name} sudah masuk keranjang.`}
        onClose={() => setToastOpen(false)}
        autoHideMs={1800}
      />
      <article
        className={`soft-panel flex h-full flex-col gap-4 p-5 transition ${
          isClosed ? "opacity-60" : "hover:-translate-y-1"
        }`}
        style={isClosed ? { opacity: 0.18, filter: "grayscale(1) brightness(0.85)" } : undefined}
        role="link"
        tabIndex={0}
        onClick={navigateToDetail}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            navigateToDetail();
          }
        }}
      >
        <div className="flex items-center justify-between">
          <StatusBadge status={product.status} />
          <span className="text-xs font-semibold text-ink/60">
            {agencyName ? agencyName : categoryLabels[product.category]}
          </span>
        </div>
        <div className={`product-card-image flex ${imageHeight} items-center justify-center rounded-2xl bg-gradient-to-br from-ice via-white to-fog text-ink/60`}>
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">Sabai</span>
        </div>
        <div className="space-y-2">
          <Link
            href={`/product/${product.id}`}
            className="text-base font-semibold text-ink transition hover:text-sky"
            onClick={(event) => event.stopPropagation()}
          >
            {product.name}
          </Link>
          {ratingText ? (
            <p className="text-sm text-text">{ratingText}</p>
          ) : (
            <p className="text-sm text-text">{product.description}</p>
          )}
          {product.coupleGender && (
            <p className="text-xs font-semibold text-sky">Gender: {product.coupleGender}</p>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-semibold text-ink">{formatCurrency(product.price)}</span>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-ghost disabled:cursor-not-allowed disabled:opacity-50"
              onClick={(event) => {
                event.stopPropagation();
                handleAdd();
              }}
              disabled={isClosed}
              title={isClosed ? "Order closed" : undefined}
            >
              Add to Cart
            </button>
            <button
              type="button"
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              onClick={(event) => {
                event.stopPropagation();
                handleBuy();
              }}
              disabled={isClosed}
              title={isClosed ? "Order closed" : undefined}
            >
              Buy Now
            </button>
          </div>
        </div>
      </article>
    </>
  );
}
