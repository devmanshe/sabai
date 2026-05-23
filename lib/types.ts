export type ProductStatus = "preorder" | "instock" | "closed";
export type ProductCategory = "agency" | "couple" | "more";
export type CoupleGender = "boys" | "girls";
export type CategoryKind = "agency" | "couple" | "gender";
export type UserRole = "superadmin" | "admin" | "user";
export type CurrencyCode = "IDR" | "USD" | "JPY";
export type PaymentMethodType =
  | "bank_transfer"
  | "virtual_account"
  | "e_wallet"
  | "international"
  | "credit_card"
  | "qris"
  | "convenience_store";
export type PaymentPlan = "full" | "dp";
export type PaymentStatus =
  | "to_pay"
  | "pending"
  | "partially_paid"
  | "waiting_settlement"
  | "paid"
  | "failed"
  | "refunded";
export type OrderStatus =
  | "to_pay"
  | "waiting_external"
  | "on_process"
  | "ready"
  | "waiting_settlement"
  | "to_ship"
  | "to_receive"
  | "completed"
  | "cancelled"
  | "returned";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rating?: number;
  reviews?: number;
  status: ProductStatus;
  category: ProductCategory;
  agencyId?: string;
  coupleGender?: CoupleGender;
  image?: string;
  stock: number;
  deadline?: string; // ISO date string for preorder deadline
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  kind: CategoryKind;
  name: string;
  parentId?: string;
  locked?: boolean;
  description?: string;
  createdAt?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  status: "active" | "inactive" | "banned";
  createdAt: string;
}

export interface SiteSettings {
  storeName: string;
  logo?: string;
  whatsappNumber: string;
  bankAccounts: Array<{
    bankName: string;
    accountNumber: string;
    accountName: string;
  }>;
  contactEmail: string;
  warehouseLocation?: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethodId: string;
  paymentMethod: string;
  paymentType: PaymentPlan;
  paymentChannel: PaymentMethodType;
  paymentReference: string;
  paymentProofName: string | null;
  currency: CurrencyCode;
  exchangeRate: number;
  amountPaid: number;
  remainingAmount: number;
  items: CartItem[];
  itemCount: number;
  total: number;
  shippingCost: number;
  baseGrandTotal: number;
  grandTotal: number;
  shipping_method?: "lion_parcel" | "shopee" | "tiktok";
  external_checkout_link?: string | null;
  external_order_id?: string | null;
  notes?: string | null;
  // Midtrans fields
  midtrans_transaction_id?: string;
  midtrans_snap_token?: string;
  dp_amount?: number;
  settlement_due_date?: string; // ISO date string for settlement deadline
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  autoConfirm: boolean;
  requiresProof: boolean;
}

export interface UserProfile {
  fullName: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  postalCode: string;
}

export interface User {
  name: string;
  username: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
}
