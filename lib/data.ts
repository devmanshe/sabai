import type {
  AdminUser,
  Category,
  Product,
  ProductCategory,
  ProductStatus,
  SiteSettings
} from "./types";

export const statusFilters: { value: ProductStatus | "all"; label: string }[] = [
  { value: "all", label: "All Product" },
  { value: "preorder", label: "Pre-order" },
  { value: "instock", label: "In Stock" },
  { value: "closed", label: "Closed" }
];

export const categoryFilters: { value: ProductCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "agency", label: "Agency" },
  { value: "couple", label: "Couple" },
  { value: "more", label: "More" }
];

export const products: Product[] = [
  {
    id: "sm-001",
    name: "Sabai Studio Lamp",
    description: "Soft ambient lamp for desks and cozy corners.",
    price: 29.9,
    rating: 5.0,
    reviews: 2000,
    status: "preorder",
    category: "agency",
    agencyId: "agency-gmm",
    stock: 45,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "sm-002",
    name: "Bangkok Sound Pods",
    description: "Compact earbuds with smooth bass and clear mids.",
    price: 12.0,
    rating: 4.9,
    reviews: 1200,
    status: "instock",
    category: "couple",
    agencyId: "agency-gmm",
    coupleGender: "boys",
    stock: 120,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "sm-003",
    name: "Adudu Cleaner Mini",
    description: "Desk vacuum that keeps merch shoots spotless.",
    price: 29.9,
    rating: 4.4,
    reviews: 1000,
    status: "closed",
    category: "couple",
    agencyId: "agency-riser",
    coupleGender: "girls",
    stock: 0,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "sm-004",
    name: "Chiang Mai Webcam",
    description: "Stay on-brand with crisp 1080p streaming.",
    price: 50.0,
    rating: 4.8,
    reviews: 120,
    status: "instock",
    category: "agency",
    agencyId: "agency-riser",
    stock: 35,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "sm-005",
    name: "Sabai Aroma Diffuser",
    description: "Ceramic diffuser for soft, warm aroma flow.",
    price: 19.5,
    rating: 4.8,
    reviews: 2000,
    status: "preorder",
    category: "couple",
    agencyId: "agency-gmm",
    coupleGender: "girls",
    stock: 60,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "sm-006",
    name: "GO Storage Tray",
    description: "Minimal tray for keeping merch hauls sorted.",
    price: 16.75,
    rating: 4.8,
    reviews: 2400,
    status: "instock",
    category: "agency",
    agencyId: "agency-alt",
    stock: 200,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "sm-007",
    name: "Sabai Tote Edition",
    description: "Canvas tote with clean embroidered mark.",
    price: 22.0,
    rating: 4.6,
    reviews: 1200,
    status: "preorder",
    category: "agency",
    agencyId: "agency-alt",
    stock: 80,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "sm-008",
    name: "Couple Mood Candle",
    description: "Candle pair inspired by night market vibes.",
    price: 18.0,
    rating: 4.8,
    reviews: 2400,
    status: "instock",
    category: "couple",
    agencyId: "agency-riser",
    coupleGender: "boys",
    stock: 150,
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "sm-009",
    name: "Closed Edition Vinyl",
    description: "Limited collector vinyl with Sabai art sleeve.",
    price: 34.1,
    rating: 4.4,
    reviews: 1000,
    status: "closed",
    category: "agency",
    agencyId: "agency-gmm",
    stock: 0,
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const defaultCategories: Category[] = [
  {
    id: "agency-gmm",
    kind: "agency",
    name: "GMM Agency",
    description: "Main agency roster"
  },
  {
    id: "agency-riser",
    kind: "agency",
    name: "Riser Agency",
    description: "Partner agency"
  },
  {
    id: "agency-alt",
    kind: "agency",
    name: "Alt Pop Agency",
    description: "Alternative merch lineup"
  },
  {
    id: "couple-gmm-01",
    kind: "couple",
    parentId: "agency-gmm",
    name: "Bam x Win",
    description: "Official couple merch line"
  },
  {
    id: "couple-riser-01",
    kind: "couple",
    parentId: "agency-riser",
    name: "Nani x Prim",
    description: "Special collaboration"
  },
  {
    id: "gender-boys",
    kind: "gender",
    name: "Couple Boys",
    description: "Filter couple line for boys",
    locked: true
  },
  {
    id: "gender-girls",
    kind: "gender",
    name: "Couple Girls",
    description: "Filter couple line for girls",
    locked: true
  }
];

export const sampleAdminUsers: AdminUser[] = [
  {
    id: "user-admin-001",
    name: "Admin User",
    email: "admin@sabaimerch.local",
    username: "admin",
    role: "admin",
    status: "active",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "user-sa-001",
    name: "Super Admin",
    email: "superadmin@sabaimerch.local",
    username: "superadmin",
    role: "superadmin",
    status: "active",
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "user-reg-001",
    name: "Customer One",
    email: "customer1@example.com",
    username: "customer1",
    role: "user",
    status: "active",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "user-reg-002",
    name: "Customer Two",
    email: "customer2@example.com",
    username: "customer2",
    role: "user",
    status: "active",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const defaultSettings: SiteSettings = {
  storeName: "Sabai Merch",
  whatsappNumber: "6281234567890",
  bankAccounts: [
    {
      bankName: "BCA",
      accountNumber: "1234567890",
      accountName: "Sabai Merch"
    },
    {
      bankName: "Mandiri",
      accountNumber: "0987654321",
      accountName: "Sabai Store"
    }
  ],
  contactEmail: "support@sabaimerch.local",
  warehouseLocation: "Jakarta"
};

export const featuredProducts = products.filter((product) =>
  ["sm-001", "sm-004", "sm-005", "sm-008"].includes(product.id)
);

export const recommendationProducts = products.filter((product) =>
  ["sm-002", "sm-007", "sm-006"].includes(product.id)
);

export const statusLabels: Record<ProductStatus, string> = {
  preorder: "Pre-order",
  instock: "In Stock",
  closed: "Closed"
};

export const categoryLabels: Record<ProductCategory, string> = {
  agency: "Agency",
  couple: "Couple",
  more: "More"
};
