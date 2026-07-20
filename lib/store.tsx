"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type {
  AdminUser,
  AddressBookEntry,
  CartItem,
  Category,
  CurrencyCode,
  Order,
  PaymentMethodType,
  PaymentPlan,
  PaymentStatus,
  Product,
  ProductImageInput,
  ProfileNotificationSettings,
  SiteSettings,
  User,
  UserProfile,
  UserRole
} from "./types";
import {
  defaultCategories,
  defaultSettings,
  products as defaultProducts,
  sampleAdminUsers
} from "./data";
import { supabase } from "./supabase";
import {
  getUserProfile,
  signIn as signInWithSupabase,
  signUp as signUpWithSupabase,
  updateUserProfile as updateUserProfileInSupabase
} from "./auth-service";
import {
  createProduct as createProductInSupabase,
  deleteProduct as deleteProductInSupabase,
  fetchProducts,
  updateProduct as updateProductInSupabase
} from "./product-service";
import type { ProductImageInput } from "./types";

const STORAGE_KEY = "sabai-merch-state";

interface AppContextValue {
  user: User | null;
  cart: CartItem[];
  orders: Order[];
  products: Product[];
  categories: Category[];
  users: AdminUser[];
  settings: SiteSettings;
  isReady: boolean;
  profileComplete: boolean;
  cartCount: number;
  cartTotal: number;
  login: (payload: { identifier: string; password: string }) => Promise<User>;
  register: (payload: {
    name: string;
    username: string;
    phone: string;
    email: string;
    password: string;
  }) => Promise<User>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  addToCart: (product: Product, qty?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: Order["paymentStatus"]) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  placeOrder: (payload: {
    paymentMethodId: string;
    paymentMethod: string;
    paymentType: PaymentPlan;
    paymentChannel: PaymentMethodType;
    shippingCost: number;
    shipping_method?: Order["shipping_method"];
    external_checkout_link?: string | null;
    external_order_id?: string | null;
    notes?: string | null;
    currency: CurrencyCode;
    exchangeRate: number;
    paymentReference: string;
    paymentStatus: PaymentStatus;
    paymentProofName: string | null;
    amountPaid: number;
    remainingAmount: number;
    orderStatus: Order["status"];
  }) => Order | null;
  // Product management (Super Admin)
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">, images?: ProductImageInput[]) => Promise<void>;
  editProduct: (id: string, updates: Partial<Product>, images?: ProductImageInput[]) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  // Category management (Super Admin)
  addCategory: (category: Omit<Category, "id" | "createdAt">) => void;
  editCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  // User management (Super Admin)
  addUser: (user: Omit<AdminUser, "id" | "createdAt">) => void;
  editUser: (id: string, updates: Partial<AdminUser>) => void;
  deleteUser: (id: string) => void;
  updateUserRole: (id: string, role: UserRole) => void;
  // Settings (Super Admin)
  updateSettings: (settings: Partial<SiteSettings>) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const emptyProfile: UserProfile = {
  fullName: "",
  phone: "",
  address: "",
  province: "",
  city: "",
  postalCode: "",
  avatarUrl: null,
  avatarName: null,
  birthDate: null,
  gender: "",
  defaultAddressId: null,
  addressBook: [],
  notifications: {
    emailStatusOrder: true,
    emailPayment: true,
    emailShipping: true,
    whatsappGo: true,
    whatsappArrived: true,
    whatsappLink: true
  }
};

const defaultNotifications: ProfileNotificationSettings = {
  emailStatusOrder: true,
  emailPayment: true,
  emailShipping: true,
  whatsappGo: true,
  whatsappArrived: true,
  whatsappLink: true
};

const normalizeAddressBook = (addresses?: AddressBookEntry[] | null): AddressBookEntry[] =>
  (addresses ?? []).map((address, index) => ({
    id: address.id || `addr-${index + 1}`,
    label: address.label || `Alamat ${index + 1}`,
    recipientName: address.recipientName || "",
    phone: address.phone || "",
    address: address.address || "",
    province: address.province || "",
    city: address.city || "",
    postalCode: address.postalCode || "",
    notes: address.notes ?? "",
    isDefault: Boolean(address.isDefault)
  }));

const normalizeProfile = (profile?: Partial<UserProfile> | null): UserProfile => {
  const addressBook = normalizeAddressBook(profile?.addressBook);
  return {
    ...emptyProfile,
    ...(profile ?? {}),
    avatarUrl: profile?.avatarUrl ?? null,
    avatarName: profile?.avatarName ?? null,
    birthDate: profile?.birthDate ?? null,
    gender: profile?.gender ?? "",
    defaultAddressId: profile?.defaultAddressId ?? null,
    addressBook,
    notifications: {
      ...defaultNotifications,
      ...(profile?.notifications ?? {})
    }
  };
};

const createOrderId = () => {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `#VM-${random}`;
};

const normalizeCategory = (entry: Partial<Category> & Record<string, unknown>): Category => ({
  id: String(entry.id ?? `category-${Date.now()}`),
  kind: entry.kind as Category["kind"],
  name: String(entry.name ?? "Untitled Category"),
  parentId: entry.parentId ? String(entry.parentId) : undefined,
  locked: Boolean(entry.locked),
  description: entry.description ? String(entry.description) : undefined,
  createdAt: entry.createdAt ? String(entry.createdAt) : undefined,
  updatedAt: entry.updatedAt ? String(entry.updatedAt) : undefined,
  slug: entry.slug ? String(entry.slug) : undefined,
  imageUrl: entry.imageUrl ? String(entry.imageUrl) : null,
  isActive: typeof entry.isActive === "boolean" ? entry.isActive : undefined
});


const legacyPaymentMethodTypes = new Set<PaymentMethodType>([
  "bank_transfer",
  "virtual_account",
  "e_wallet",
  "international",
  "credit_card",
  "qris",
  "convenience_store"
]);

const normalizeOrder = (rawOrder: Partial<Order>): Order => {
  const safeGrandTotal = Number(rawOrder.grandTotal ?? rawOrder.baseGrandTotal ?? 0);
  const safeShippingCost = Number(rawOrder.shippingCost ?? 0);
  const safeTotal = Number(rawOrder.total ?? Math.max(0, safeGrandTotal - safeShippingCost));
  const rawPaymentType = rawOrder.paymentType as unknown;
  const normalizedPaymentType: PaymentPlan = rawPaymentType === "dp" ? "dp" : "full";
  const rawStatus = rawOrder.status as unknown as string | undefined;
  const rawPaymentStatus = rawOrder.paymentStatus as unknown as string | undefined;
  const normalizedPaymentChannel = rawOrder.paymentChannel
    ?? (typeof rawPaymentType === "string" && legacyPaymentMethodTypes.has(rawPaymentType as PaymentMethodType)
      ? (rawPaymentType as PaymentMethodType)
      : "virtual_account");
  const normalizedStatus = rawStatus === "pre_order" ? "on_process" : ((rawOrder.status ?? "on_process") as Order["status"]);

  let normalizedPaymentStatus: PaymentStatus;
  if (rawPaymentStatus === "to_pay" || rawPaymentStatus === "pending" || rawPaymentStatus === "dp_paid" || rawPaymentStatus === "fully_paid" || rawPaymentStatus === "failed" || rawPaymentStatus === "refunded") {
    normalizedPaymentStatus = rawPaymentStatus as PaymentStatus;
  } else if (rawPaymentStatus === "partially_paid") {
    normalizedPaymentStatus = "dp_paid";
  } else if (rawPaymentStatus === "paid") {
    normalizedPaymentStatus = "fully_paid";
  } else if (rawPaymentStatus === "waiting_settlement") {
    normalizedPaymentStatus = "to_pay";
  } else if (rawPaymentStatus === "unpaid") {
    normalizedPaymentStatus = "to_pay";
  } else {
    normalizedPaymentStatus = "to_pay";
  }

  const safeAmountPaid = Number(
    rawOrder.amountPaid
      ?? (normalizedPaymentStatus === "fully_paid"
        ? safeGrandTotal
        : normalizedPaymentStatus === "dp_paid"
          ? Math.max(0, Math.round(safeGrandTotal * 0.3))
          : 0)
  );
  const safeRemaining = Number(rawOrder.remainingAmount ?? Math.max(0, safeGrandTotal - safeAmountPaid));

  return {
    id: rawOrder.id ?? createOrderId(),
    createdAt: rawOrder.createdAt ?? new Date().toISOString(),
    customerName: rawOrder.customerName ?? "Guest User",
    customerPhone: rawOrder.customerPhone ?? "-",
    customerAddress: rawOrder.customerAddress ?? "Alamat belum tersedia",
    status: normalizedStatus,
    paymentStatus: normalizedPaymentStatus,
    paymentMethodId: rawOrder.paymentMethodId ?? "legacy",
    paymentMethod: rawOrder.paymentMethod ?? "Unknown Payment",
    paymentType: normalizedPaymentType,
    paymentChannel: normalizedPaymentChannel,
    paymentReference: rawOrder.paymentReference ?? "-",
    paymentProofName: rawOrder.paymentProofName ?? null,
    currency: rawOrder.currency ?? "IDR",
    exchangeRate: Number(rawOrder.exchangeRate ?? 1),
    amountPaid: safeAmountPaid,
    remainingAmount: safeRemaining,
    items: rawOrder.items ?? [],
    itemCount: Number(rawOrder.itemCount ?? 0),
    total: safeTotal,
    shippingCost: safeShippingCost,
    baseGrandTotal: Number(rawOrder.baseGrandTotal ?? safeGrandTotal),
    grandTotal: safeGrandTotal,
    shipping_method: (rawOrder as any).shipping_method ?? "lion_parcel",
    shipment_status: (rawOrder as any).shipment_status ?? "on_going",
    external_checkout_link: rawOrder.external_checkout_link ?? null,
    external_order_id: rawOrder.external_order_id ?? null,
    notes: rawOrder.notes ?? null,
    settlementProofName: (rawOrder as any).settlementProofName ?? null,
    // Midtrans fields
    midtrans_transaction_id: rawOrder.midtrans_transaction_id ?? undefined,
    midtrans_snap_token: rawOrder.midtrans_snap_token ?? undefined,
    dp_amount: rawOrder.dp_amount ?? undefined,
    settlement_due_date: rawOrder.settlement_due_date ?? undefined
  };
};

const isProfileComplete = (profile?: UserProfile | null) => {
  if (!profile) return false;
  const primaryAddress = (profile.addressBook ?? []).find((address) => address.isDefault) || (profile.addressBook ?? [])[0];
  return (
    Boolean(profile.fullName.trim()) &&
    /^\d{8,15}$/.test(profile.phone.trim()) &&
    Boolean(primaryAddress?.address?.trim()) &&
    Boolean(primaryAddress?.province?.trim()) &&
    Boolean(primaryAddress?.city?.trim()) &&
    /^\d{5}$/.test((primaryAddress?.postalCode ?? "").trim())
  );
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [users, setUsers] = useState<AdminUser[]>(sampleAdminUsers);
  const [memberAccounts, setMemberAccounts] = useState<User[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (!isMounted) return;

        const nextCategories = (data ?? []).map((entry) =>
          normalizeCategory({
            ...entry,
            id: entry.id,
            name: entry.name,
            description: entry.description,
            createdAt: entry.created_at,
            updatedAt: entry.updated_at,
            slug: entry.slug,
            imageUrl: entry.image_url,
            isActive: entry.is_active,
            kind: undefined,
            parentId: undefined,
            locked: false
          })
        );

        setCategories(nextCategories.length > 0 ? nextCategories : defaultCategories);
      } catch (error) {
        console.error("Failed to load categories from Supabase", error);
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const fetched = await fetchProducts(categories);
        if (!isMounted) return;

        if (fetched.length > 0) {
          setProducts(fetched);
        } else {
          setProducts(defaultProducts);
        }
      } catch (error) {
        console.error("Failed to load products from Supabase", error);
        if (isMounted) setProducts(defaultProducts);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [categories]);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as {
          user: User | null;
          cart: CartItem[];
          orders?: Order[];
          memberAccounts?: User[];
        };
        // Always start as guest to prevent accidental auto-login from stale local storage.
        setUser(null);
        setCart(parsed.cart ?? []);
        setOrders((parsed.orders ?? []).map((rawOrder) => normalizeOrder(rawOrder)));
        setMemberAccounts((parsed.memberAccounts ?? []).map((account) => ({
          ...account,
          profile: normalizeProfile(account.profile)
        })));
      } catch {
        setUser(null);
        setCart([]);
        setOrders([]);
        setMemberAccounts([]);
      }
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user,
        cart,
        orders,
        memberAccounts
      })
    );
  }, [user, cart, orders, memberAccounts, isReady]);

  const buildAuthenticatedUser = async (
    authUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown> },
    fallbackRole: UserRole
  ) => {
    const profile = (await getUserProfile(authUser.id)) as (UserProfile & { role?: UserRole }) | null;
    const resolvedRole = profile?.role ?? fallbackRole;

    const appUser: User = {
      id: authUser.id,
      name:
        (authUser.user_metadata?.full_name as string | undefined) ||
        authUser.email ||
        "Sabai Member",
      username:
        (authUser.user_metadata?.username as string | undefined) ||
        authUser.email?.split("@")[0] ||
        "",
      email: authUser.email || "",
      role: resolvedRole,
      profile: normalizeProfile(profile ?? emptyProfile)
    };

    setUser(appUser);
    setMemberAccounts((prev) => {
      const filtered = prev.filter(
        (account) =>
          account.username.toLowerCase() !== appUser.username.toLowerCase() &&
          account.email.toLowerCase() !== appUser.email.toLowerCase()
      );
      return [appUser, ...filtered];
    });

    return appUser;
  };

  const login = async ({ identifier, password }: { identifier: string; password: string }) => {
    const authUser = await signInWithSupabase({ email: identifier, password });
    return buildAuthenticatedUser(authUser, "user");
  };

  const register = async ({ name, username, phone, email, password }: { name: string; username: string; phone: string; email: string; password: string }) => {
    const authUser = await signUpWithSupabase({
      email,
      password,
      username,
      fullName: name,
      phone
    });

    return buildAuthenticatedUser(authUser, "user");
  };

  const logout = () => {
    setUser(null);
    setCart([]);
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!user) return;

    const nextUser: User = {
      ...user,
      profile: normalizeProfile({
        ...user.profile,
        ...profile
      })
    };

    setUser(nextUser);

    if (nextUser.role === "user") {
      setMemberAccounts((prev) =>
        prev.map((account) => {
          const sameUsername = account.username.toLowerCase() === nextUser.username.toLowerCase();
          const sameEmail = account.email.toLowerCase() === nextUser.email.toLowerCase();
          return sameUsername || sameEmail ? nextUser : account;
        })
      );
    }

    try {
      await updateUserProfileInSupabase(user.id, profile);
    } catch (error) {
      console.error("Failed to persist profile to Supabase", error);
      throw error;
    }
  };

  const addToCart = (product: Product, qty = 1) => {
    if (!user) return false;
    if (product.status === "closed") return false;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + qty }
            : item
        );
      }
      return [...prev, { product, qty }];
    });
    return true;
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId ? { ...item, qty: Math.max(1, qty) } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)));
  };

  const updatePaymentStatus = (orderId: string, paymentStatus: Order["paymentStatus"]) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, paymentStatus } : order))
    );
  };

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, ...updates } : order))
    );
  };

  const placeOrder = ({
    paymentMethodId,
    paymentMethod,
    paymentType,
    paymentChannel,
    shippingCost,
    shipping_method,
    external_checkout_link,
    external_order_id,
    notes,
    currency,
    exchangeRate,
    paymentReference,
    paymentStatus,
    paymentProofName,
    settlementProofName,
    amountPaid,
    remainingAmount,
    orderStatus,
    midtrans_transaction_id,
    midtrans_snap_token,
    dp_amount,
    settlement_due_date
  }: {
    paymentMethodId: string;
    paymentMethod: string;
    paymentType: PaymentPlan;
    paymentChannel: PaymentMethodType;
    shippingCost: number;
    shipping_method?: "lion_parcel" | "shopee" | "tiktok";
    external_checkout_link?: string | null;
    external_order_id?: string | null;
    notes?: string | null;
    currency: CurrencyCode;
    exchangeRate: number;
    paymentReference: string;
    paymentStatus: PaymentStatus;
    paymentProofName: string | null;
    settlementProofName?: string | null;
    amountPaid: number;
    remainingAmount: number;
    orderStatus: Order["status"];
    midtrans_transaction_id?: string;
    midtrans_snap_token?: string;
    dp_amount?: number;
    settlement_due_date?: string;
  }) => {
    if (!user || cart.length === 0) return null;

    const baseGrandTotal = cartTotal + shippingCost;
    const grandTotal = Number((baseGrandTotal / exchangeRate).toFixed(2));
    const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const profileName = user.profile.fullName?.trim();
    const customerName = profileName || user.name;
    const customerPhone = user.profile.phone?.trim() || "-";
    const customerAddress = [
      user.profile.address,
      user.profile.city,
      user.profile.province,
      user.profile.postalCode
    ]
      .filter(Boolean)
      .join(", ");

    const order: Order = {
      id: createOrderId(),
      createdAt: new Date().toISOString(),
      customerName,
      customerPhone,
      customerAddress: customerAddress || "Alamat belum tersedia",
      status: orderStatus,
      paymentStatus,
      paymentMethodId,
      paymentMethod,
      paymentType,
      paymentChannel,
      paymentReference,
      paymentProofName,
      settlementProofName: settlementProofName ?? null,
      currency,
      exchangeRate,
      amountPaid,
      remainingAmount,
      items: cart.map((item) => ({ ...item })),
      itemCount,
      total: cartTotal,
      shippingCost,
      baseGrandTotal,
      grandTotal,
      shipping_method: shipping_method ?? "lion_parcel",
      external_checkout_link: external_checkout_link ?? null,
      external_order_id: external_order_id ?? null,
      notes: notes ?? null,
      // Midtrans fields
      midtrans_transaction_id,
      midtrans_snap_token,
      dp_amount,
      settlement_due_date
    };

    setOrders((prev) => [order, ...prev]);
    setCart([]);
    return order;
  };

  // Product Management (Super Admin)
  const addProduct = async (
    product: Omit<Product, "id" | "createdAt" | "updatedAt">,
    images: ProductImageInput[] = []
  ): Promise<void> => {
    try {
      const created = await createProductInSupabase(product, images);
      setProducts((prev) => [created, ...prev]);
    } catch (err) {
      console.error("addProduct error", err);
      throw err;
    }
  };

  const editProduct = async (
    id: string,
    updates: Partial<Product>,
    images?: ProductImageInput[]
  ): Promise<void> => {
    try {
      const updated = await updateProductInSupabase(id, updates, images);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );
    } catch (err) {
      console.error("editProduct error", err);
      throw err;
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    try {
      await deleteProductInSupabase(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("deleteProduct error", err);
      throw err;
    }
  };

  // Category Management (Super Admin)
  const addCategory = (category: Omit<Category, "id" | "createdAt">) => {
    const newCategory: Category = {
      ...category,
      id: `${category.kind}-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setCategories((prev) => [newCategory, ...prev]);
  };

  const editCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => {
      const target = prev.find((entry) => entry.id === id);
      if (!target || target.locked) return prev;

      const removeIds = new Set<string>([id]);

      if (target.kind === "agency") {
        prev
          .filter((entry) => entry.kind === "couple" && entry.parentId === id)
          .forEach((entry) => removeIds.add(entry.id));
      }

      return prev.filter((entry) => !removeIds.has(entry.id));
    });

    // Unlink products from removed agency/couple category mapping.
    setProducts((prev) =>
      prev.map((product) => {
        if (product.agencyId === id) {
          return { ...product, agencyId: undefined };
        }
        return product;
      })
    );
  };

  // User Management (Super Admin)
  const addUser = (user: Omit<AdminUser, "id" | "createdAt">) => {
    const newUser: AdminUser = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  const editUser = (id: string, updates: Partial<AdminUser>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const updateUserRole = (id: string, role: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role } : u))
    );
  };

  // Settings (Super Admin)
  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const profileComplete = useMemo(() => isProfileComplete(user?.profile), [user]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty * item.product.price, 0),
    [cart]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      cart,
      orders,
      products,
      categories,
      users,
      settings,
      isReady,
      profileComplete,
      cartCount,
      cartTotal,
      login,
      register,
      logout,
      updateProfile,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      updateOrderStatus,
      updatePaymentStatus,
      updateOrder,
      placeOrder,
      // Product Management
      addProduct,
      editProduct,
      deleteProduct,
      // Category Management
      addCategory,
      editCategory,
      deleteCategory,
      // User Management
      addUser,
      editUser,
      deleteUser,
      updateUserRole,
      // Settings
      updateSettings
    }),
    [
      user,
      cart,
      orders,
      products,
      categories,
      users,
      settings,
      isReady,
      profileComplete,
      cartCount,
      cartTotal
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
