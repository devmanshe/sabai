"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";

const menuItems = [
  { label: "Beranda", href: "/" },
  { label: "Agency", href: "/shop?category=agency" },
  { label: "Couple", href: "/shop?category=couple" },
  { label: "More", href: "/shop?category=more" },
  { label: "Contact", href: "/#contact" }
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SM";

export default function Navbar() {
  const router = useRouter();
  const { user, cartCount, logout, categories } = useApp();
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [openMenu, setOpenMenu] = useState<"agency" | "more" | null>(null);
  const avatarMenuRef = useRef<HTMLDivElement | null>(null);
  const navMenuRef = useRef<HTMLDivElement | null>(null);
  const agencyOptions = categories.filter((entry) => entry.kind === "agency");
  const genderOptions = categories.filter((entry) => entry.kind === "gender");

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
    if (!openMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!navMenuRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  return (
    <header className="sticky top-4 z-50">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center justify-between gap-4 rounded-full bg-white/90 px-5 py-3 shadow-soft backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/img/Logo%20w%20Text.png" alt="Sabai Merch" width={140} height={40} />
          </Link>

          <nav className="flex flex-1 items-center justify-center gap-4 text-xs font-semibold text-ink/70 sm:gap-6 sm:text-sm" ref={navMenuRef}>
            <Link href="/" className="whitespace-nowrap transition hover:text-ink">
              Beranda
            </Link>

            <div className="relative">
              <button
                type="button"
                className="whitespace-nowrap transition hover:text-ink"
                onClick={() => setOpenMenu((prev) => (prev === "agency" ? null : "agency"))}
              >
                Agency
              </button>
              {openMenu === "agency" && (
                <div className="absolute left-0 top-10 z-50 min-w-56 rounded-2xl border border-[#d9e0e7] bg-white p-2 shadow-[0_12px_24px_rgba(20,40,60,0.14)]">
                  {agencyOptions.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        router.push(`/shop?agency=${encodeURIComponent(entry.id)}`);
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#33485c] transition hover:bg-[#eef4f8]"
                    >
                      {entry.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      router.push("/shop");
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#33485c] transition hover:bg-[#eef4f8]"
                  >
                    All Agency Products
                  </button>
                </div>
              )}
            </div>

            <Link href="/couple" className="whitespace-nowrap transition hover:text-ink">
              Couple
            </Link>

            <div className="relative">
              <button
                type="button"
                className="whitespace-nowrap transition hover:text-ink"
                onClick={() => setOpenMenu((prev) => (prev === "more" ? null : "more"))}
              >
                More
              </button>
              {openMenu === "more" && (
                <div className="absolute left-0 top-10 z-50 min-w-48 rounded-2xl border border-[#d9e0e7] bg-white p-2 shadow-[0_12px_24px_rgba(20,40,60,0.14)]">
                  {genderOptions.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        router.push(`/couple?gender=${entry.id === "gender-girls" ? "girls" : "boys"}`);
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#33485c] transition hover:bg-[#eef4f8]"
                    >
                      {entry.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a href="#contact" className="whitespace-nowrap transition hover:text-ink">
              Contact
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/shop"
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-ice text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M15.5 15.5L21 21M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-ice text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M6 7h14l-2 9H8L6 7ZM6 7 5 4H3M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-sky px-2 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <div className="relative" ref={avatarMenuRef}>
              {user ? (
                <button
                  type="button"
                  onClick={() => setShowAvatarMenu((prev) => !prev)}
                  aria-label="Profile"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white"
                >
                  {getInitials(user.name)}
                </button>
              ) : (
                <Link
                  href="/auth"
                  aria-label="Profile"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white"
                >
                  {getInitials("Guest")}
                </Link>
              )}

              {user && showAvatarMenu && (
                <div className="absolute right-0 top-12 z-50 w-40 rounded-xl border border-[#d9e0e7] bg-white p-2 shadow-[0_12px_24px_rgba(20,40,60,0.14)]">
                  <Link
                    href="/profile"
                    onClick={() => setShowAvatarMenu(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-[#33485c] transition hover:bg-[#eef4f8]"
                  >
                    Profil Saya
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setShowAvatarMenu(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-[#33485c] transition hover:bg-[#eef4f8]"
                  >
                    Pesanan Saya
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setShowAvatarMenu(false);
                      router.push("/");
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#33485c] transition hover:bg-[#eef4f8]"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
