"use client";

import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { RequireAuth } from "@/components/Protected";
import { useApp } from "@/lib/store";

const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);

export default function CartPage() {
  const { cart, updateQty, removeFromCart, cartTotal } = useApp();

  return (
    <SiteShell>
      <RequireAuth>
        <section className="cart-page">
          <h1>Keranjang</h1>

          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>Keranjang kamu masih kosong.</p>
              <Link href="/shop" className="cart-buy-btn">
                Belanja Sekarang
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-list-panel">
                <div className="cart-select-all">
                  <div className="cart-checkbox" />
                  <span>Pilih Semua ({cart.length})</span>
                  <button type="button">Hapus</button>
                </div>

                {cart.map((item) => (
                  <article key={item.product.id} className="cart-item-card">
                    <div className="cart-store-row">
                      <div className="cart-checkbox active" />
                      <strong>{item.product.category.toUpperCase()} STORE</strong>
                    </div>

                    <div className="cart-item-row">
                      <div className="cart-checkbox active" />
                      <div className="cart-item-image">GO</div>
                      <div className="cart-item-info">
                        <h3>{item.product.name}</h3>
                        <p>{item.product.description}</p>
                      </div>
                      <div className="cart-item-price">{formatIDR(item.product.price * item.qty)}</div>
                    </div>

                    <div className="cart-actions-row">
                      <button type="button" onClick={() => removeFromCart(item.product.id)}>
                        Hapus
                      </button>
                      <div className="cart-qty-control">
                        <button type="button" onClick={() => updateQty(item.product.id, item.qty - 1)}>
                          -
                        </button>
                        <span>{item.qty}</span>
                        <button type="button" onClick={() => updateQty(item.product.id, item.qty + 1)}>
                          +
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="cart-summary-panel">
                <h2>Ringkasan belanja</h2>
                <div className="cart-summary-row">
                  <span>Total</span>
                  <strong>{formatIDR(cartTotal)}</strong>
                </div>
                <div className="cart-promo-box">Lagi belum ada promo, nih</div>
                <Link href="/checkout" className="cart-buy-btn">
                  Beli ({cart.length})
                </Link>
              </aside>
            </div>
          )}
        </section>
      </RequireAuth>
    </SiteShell>
  );
}
