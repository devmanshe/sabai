"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import type { Product, ProductCategory, ProductStatus } from "@/lib/types";
import AppToast from "@/components/AppToast";

interface LegacyProduct extends Product {
  rating: string;
  label: string;
  accent: string;
}

const legacyProducts: LegacyProduct[] = [
  {
    id: "sm-001",
    name: "Phone Holder Sakti",
    description: "Minimal stand for clean GO setups.",
    price: 29.9,
    status: "preorder",
    category: "agency",
    agencyId: "agency-gmm",
    rating: "5.0 (2k Reviews)",
    label: "Pre-Order",
    accent: "accent-1"
  },
  {
    id: "sm-002",
    name: "Headsound",
    description: "Studio-ready sound for merch drops.",
    price: 12.0,
    status: "instock",
    category: "couple",
    agencyId: "agency-gmm",
    coupleGender: "boys",
    rating: "4.9 (1.2k Reviews)",
    label: "In Stock",
    accent: "accent-2"
  },
  {
    id: "sm-003",
    name: "Adudu Cleaner",
    description: "Desk cleaner for GO packing days.",
    price: 29.9,
    status: "closed",
    category: "more",
    agencyId: "agency-riser",
    rating: "4.4 (1k Reviews)",
    label: "Closed",
    accent: "accent-3"
  },
  {
    id: "sm-004",
    name: "CCTV Maling",
    description: "Keep your merch shelf monitored.",
    price: 50.0,
    status: "instock",
    category: "agency",
    agencyId: "agency-riser",
    rating: "4.8 (120 Reviews)",
    label: "In Stock",
    accent: "accent-4"
  },
  {
    id: "sm-005",
    name: "Stuffus Peker 32",
    description: "Soft diffuser for cozy GO studios.",
    price: 9.9,
    status: "preorder",
    category: "couple",
    agencyId: "agency-gmm",
    coupleGender: "girls",
    rating: "4.8 (2k Reviews)",
    label: "Pre-Order",
    accent: "accent-5"
  },
  {
    id: "sm-006",
    name: "Stuffus R175",
    description: "Closed edition audio capsule.",
    price: 34.1,
    status: "closed",
    category: "more",
    agencyId: "agency-riser",
    rating: "4.8 (2.4k Reviews)",
    label: "Closed",
    accent: "accent-6"
  }
];

const recommendationProducts: LegacyProduct[] = [
  {
    id: "sm-007",
    name: "TWS Bujug",
    description: "GO-ready earbuds in pastel tone.",
    price: 29.9,
    status: "preorder",
    category: "couple",
    agencyId: "agency-alt",
    coupleGender: "boys",
    rating: "4.6 (1.2k Reviews)",
    label: "Pre-Order",
    accent: "accent-2"
  },
  {
    id: "sm-008",
    name: "Headsound Baptis",
    description: "Crisp sound for late night edits.",
    price: 12.0,
    status: "instock",
    category: "agency",
    agencyId: "agency-alt",
    rating: "5.0 (2k Reviews)",
    label: "In Stock",
    accent: "accent-5"
  },
  {
    id: "sm-009",
    name: "Adudu Cleaner",
    description: "Compact helper for GO packing.",
    price: 29.9,
    status: "closed",
    category: "couple",
    agencyId: "agency-gmm",
    coupleGender: "girls",
    rating: "4.4 (1k Reviews)",
    label: "Closed",
    accent: "accent-3"
  }
];

const statusOptions: { value: ProductStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "preorder", label: "Pre-order" },
  { value: "instock", label: "In Stock" },
  { value: "closed", label: "Closed" }
];

const categoryOptions: { value: ProductCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "agency", label: "Agency" },
  { value: "couple", label: "Couple" },
  { value: "more", label: "More" }
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SM";

function ProductCard({ product, mini }: { product: LegacyProduct; mini?: boolean }) {
  const router = useRouter();
  const { user, addToCart, profileComplete } = useApp();
  const isClosed = product.status === "closed";

  const navigateToDetail = () => {
    router.push(`/product/${product.id}`);
  };

  const handleAdd = () => {
    if (isClosed) return;
    if (!user) {
      router.push(`/auth?intent=cart&productId=${encodeURIComponent(product.id)}`);
      return;
    }
    addToCart(product, 1);
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
    <article
      className={`product-card ${product.accent} ${mini ? "mini" : ""} ${
        isClosed ? "closed" : ""
      }`}
      style={{ opacity: isClosed ? 0.18 : 1, filter: isClosed ? "grayscale(1) brightness(0.85)" : "none" }}
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
      <div className={`tag ${product.status}`}>{product.label}</div>
      <div className="product-visual" />
      <h3>
        <Link
          href={`/product/${product.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
          onClick={(event) => event.stopPropagation()}
        >
          {product.name}
        </Link>
      </h3>
      <div className="meta">
        <span>{product.rating}</span>
        <strong>${product.price.toFixed(2)}</strong>
      </div>
      <div className="actions-row">
        <button
          className="ghost"
          onClick={(event) => {
            event.stopPropagation();
            handleAdd();
          }}
          disabled={isClosed}
          style={{ cursor: isClosed ? "not-allowed" : "pointer" }}
        >
          Add to Cart
        </button>
        <button
          className="solid"
          onClick={(event) => {
            event.stopPropagation();
            handleBuy();
          }}
          disabled={isClosed}
          style={{ cursor: isClosed ? "not-allowed" : "pointer" }}
        >
          Buy Now
        </button>
      </div>
    </article>
  );
}

export default function LegacyShopPage() {
  const { user, cartCount, logout, categories } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState("");
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showProfileToast, setShowProfileToast] = useState(false);
  const [openNavMenu, setOpenNavMenu] = useState<"agency" | "more" | null>(null);
  const avatarMenuRef = useRef<HTMLDivElement | null>(null);
  const navMenuRef = useRef<HTMLDivElement | null>(null);

  const status = searchParams.get("status") ?? "all";
  const category = searchParams.get("category") ?? "all";
  const agency = searchParams.get("agency") ?? "all";
  const query = (searchParams.get("q") ?? "").toLowerCase();
  const notice = searchParams.get("notice");
  const agencyOptions = categories.filter((entry) => entry.kind === "agency");
  const genderOptions = categories.filter((entry) => entry.kind === "gender");

  useEffect(() => {
    setSearchValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (notice !== "complete-profile" || user?.role !== "Buyer") return;

    setShowProfileToast(true);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("notice");
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  }, [notice, pathname, router, searchParams, user?.role]);

  useEffect(() => {
    if (!showAvatarMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!avatarMenuRef.current?.contains(event.target as Node)) {
        setShowAvatarMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAvatarMenu]);

  useEffect(() => {
    if (!openNavMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!navMenuRef.current?.contains(event.target as Node)) {
        setOpenNavMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openNavMenu]);

  const filteredProducts = useMemo(() => {
    return legacyProducts.filter((product) => {
      const matchesQuery = query
        ? product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        : true;
      const matchesStatus = status === "all" ? true : product.status === status;
      const matchesCategory = category === "all" ? true : product.category === category;
      const matchesAgency = agency === "all" ? true : product.agencyId === agency;
      return matchesQuery && matchesStatus && matchesCategory && matchesAgency;
    });
  }, [query, status, category, agency]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.delete("category");
    params.delete("agency");
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    updateParam("q", searchValue.trim());
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <img src="/img/Logo%20w%20Text.png" alt="Sabai Merch" />
        </div>
        <nav className="nav" ref={navMenuRef}>
          <Link className={pathname === "/" ? "active" : ""} href="/">
            Beranda
          </Link>

          <div className="nav-dropdown-wrap">
            <button type="button" className="nav-toggle" onClick={() => setOpenNavMenu((prev) => prev === "agency" ? null : "agency") }>
              Agency
            </button>
            {openNavMenu === "agency" && (
              <div className="nav-dropdown-panel">
                {agencyOptions.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      setOpenNavMenu(null);
                      router.push(`/shop?agency=${encodeURIComponent(entry.id)}`);
                    }}
                  >
                    {entry.name}
                  </button>
                ))}
                <button type="button" onClick={() => { setOpenNavMenu(null); router.push("/shop"); }}>
                  All Agency Products
                </button>
              </div>
            )}
          </div>

          <Link href="/couple">Couple</Link>

          <div className="nav-dropdown-wrap">
            <button type="button" className="nav-toggle" onClick={() => setOpenNavMenu((prev) => prev === "more" ? null : "more") }>
              More
            </button>
            {openNavMenu === "more" && (
              <div className="nav-dropdown-panel">
                {genderOptions.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      setOpenNavMenu(null);
                      router.push(`/couple?gender=${entry.id === "gender-girls" ? "girls" : "boys"}`);
                    }}
                  >
                    {entry.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <a href="#contact">Contact</a>
        </nav>
        <div className="actions">
          <Link href="/shop" className="icon-btn" aria-label="Search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M15.5 15.5L21 21M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </Link>
          <Link href="/cart" className="icon-btn" aria-label="Cart">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 7h14l-2 9H8L6 7ZM6 7 5 4H3M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>
          <div ref={avatarMenuRef} style={{ position: "relative" }}>
            {user ? (
              <button
                type="button"
                className="avatar"
                aria-label="Profile"
                onClick={() => setShowAvatarMenu((prev) => !prev)}
              >
                <span>{getInitials(user.name)}</span>
              </button>
            ) : (
              <Link href="/auth" className="avatar" aria-label="Profile">
                <span>{getInitials("Guest")}</span>
              </Link>
            )}

            {user && showAvatarMenu && (
              <div className="avatar-dropdown">
                <Link href="/profile" onClick={() => setShowAvatarMenu(false)}>
                  Profil Saya
                </Link>
                <Link href="/orders" onClick={() => setShowAvatarMenu(false)}>
                  Pesanan Saya
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setShowAvatarMenu(false);
                    router.push("/");
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AppToast
        open={showProfileToast}
        variant="warning"
        title="Lengkapi Profile"
        message="Biar checkout dan proses order kamu lancar, lengkapi data profile dulu ya."
        actionLabel="Lengkapi Sekarang"
        onAction={() => {
          setShowProfileToast(false);
          router.push("/profile");
        }}
        onClose={() => setShowProfileToast(false)}
        autoHideMs={7000}
      />

      <section className="hero">
        <div className="hero-media">
          <div className="hero-title">Shop</div>
          <div className="hero-card">
            <div>
              <p className="hero-kicker">Your Trusted Thailand Merch GO</p>
              <h1>Curated group orders, delivered with calm and care.</h1>
            </div>
            <form className="hero-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search on Sabai Merch"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
              <button type="submit">Search</button>
            </form>
          </div>
        </div>
      </section>

      <section className="shop">
        <aside className="sidebar">
          <div className="sidebar-card">
            <div className="sidebar-title">Status</div>
            <button className="pill" type="button" onClick={resetFilters}>
              All Product <span>{legacyProducts.length}</span>
            </button>
            {agency !== "all" && (
              <button className="pill active-pill" type="button" onClick={() => updateParam("agency", "all")}>Agency Filter: {agency}</button>
            )}
            <ul className="sidebar-list">
              {statusOptions
                .filter((item) => item.value !== "all")
                .map((item) => (
                <li key={item.value}>
                  <button type="button" onClick={() => updateParam("status", item.value)}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="sidebar-card">
            <div className="sidebar-title">Category</div>
            <ul className="sidebar-list">
              {categoryOptions
                .filter((item) => item.value !== "all")
                .map((item) => (
                <li key={item.value}>
                  <button type="button" onClick={() => updateParam("category", item.value)}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="catalog">
          <div className="catalog-header">
            <div>
              <h2>Featured Pick</h2>
              <p>Signature GO items loved by the community.</p>
            </div>
            <div className="catalog-tools">
              {statusOptions
                .filter((item) => item.value !== "all")
                .map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`chip ${item.value}`}
                    onClick={() => updateParam("status", item.value)}
                  >
                    {item.label}
                  </button>
                ))}
            </div>
          </div>

          <div className="product-grid">
            {filteredProducts.length === 0 ? (
              <div className="product-card">
                <h3>No products found</h3>
                <p>Try another search or filter.</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          <div className="pagination">
            <button className="ghost">Previous</button>
            <div className="pages">
              <button className="solid">1</button>
              <button className="ghost">2</button>
              <button className="ghost">3</button>
              <span>...</span>
              <button className="ghost">9</button>
              <button className="ghost">10</button>
            </div>
            <button className="ghost">Next</button>
          </div>
        </div>
      </section>

      <section className="recommendations">
        <div className="section-head">
          <div>
            <h2>Explore our recommendations</h2>
            <p>Fresh GO picks inspired by Thai trends.</p>
          </div>
          <div className="arrow-group">
            <button className="icon-btn" aria-label="Previous">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M15 5 8 12l7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="icon-btn" aria-label="Next">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M9 5 16 12l-7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="recommendation-grid">
          {recommendationProducts.map((product) => (
            <ProductCard key={product.id} product={product} mini />
          ))}
        </div>
      </section>

      <section className="newsletter">
        <div className="newsletter-card">
          <div>
            <h2>Request Your Dream Merch ✨</h2>
            <p>Ga nemu barang yang kamu cari? Chat aja, kita bantuin 💙</p>
            <div className="newsletter-form">
              <a href="https://wa.me/6287752750421?text=Halo%20kak!%20saya%20mau%20req%20barang%20apakah%20bisa%3F" target="_blank" rel="noopener noreferrer">
                <button type="button">Contact Here 💬</button>
              </a>
            </div>
          </div>
          <div className="newsletter-note">
            <strong>Sabai Merch Support</strong>
            <p>Chat langsung dengan admin untuk request atau tanya produk</p>
          </div>
        </div>
      </section>

      <footer id="contact" className="footer">
        <div className="footer-grid">
          <div>
            <h3>About</h3>
            <ul>
              <li>Sabai Merch GO</li>
              <li>Meet the Team</li>
              <li>Contact Us</li>
            </ul>
          </div>
          <div>
            <h3>Contact</h3>
            <ul>
              <li>support@sabaimerch.com</li>
              <li>+62 877-5275-0421</li>
            </ul>
          </div>
          <div>
            <h3>Social Media</h3>
            <div className="socials">
              <a className="icon-btn" aria-label="Instagram" href="https://www.instagram.com/sabaimerch?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">IG</a>
              <a className="icon-btn" aria-label="X" href="https://x.com/sabaimerch" target="_blank" rel="noopener noreferrer">X</a>
            </div>
          </div>
        </div>
        <div className="copyright">© 2026 Sabai Merch. All rights reserved.</div>
      </footer>
    </div>
  );
}
