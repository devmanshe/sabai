import { supabase } from "./supabase";
import type {
  Category,
  CoupleGender,
  DbProductStatus,
  DbProductType,
  Product,
  ProductCategory,
  ProductImage,
  ProductImageInput,
  ProductStatus
} from "./types";

// ---------------------------------------------------------------------------
// Status / type mapping helpers
// ---------------------------------------------------------------------------

/**
 * Map DB status ('available' | 'sold_out' | 'inactive') → app ProductStatus
 * with DB product_type ('pre_order') taking priority.
 */
export function mapDbStatusToAppStatus(
  dbStatus: string,
  dbProductType: string
): ProductStatus {
  if (dbProductType === "pre_order") return "preorder";
  if (dbStatus === "available") return "instock";
  if (dbStatus === "sold_out") return "closed";
  if (dbStatus === "inactive") return "closed";
  return "instock";
}

/** Map app ProductStatus → DB status + product_type pair */
export function mapAppStatusToDb(appStatus: ProductStatus): {
  status: DbProductStatus;
  product_type: DbProductType;
} {
  switch (appStatus) {
    case "preorder":
      return { status: "available", product_type: "pre_order" };
    case "instock":
      return { status: "available", product_type: "ready_stock" };
    case "closed":
    default:
      return { status: "sold_out", product_type: "ready_stock" };
  }
}

// ---------------------------------------------------------------------------
// Row mappers
// ---------------------------------------------------------------------------

export function mapProductImageRow(row: Record<string, unknown>): ProductImage {
  return {
    id: String(row.id ?? ""),
    productId: String(row.product_id ?? ""),
    imageUrl: String(row.image_url ?? ""),
    altText: row.alt_text ? String(row.alt_text) : undefined,
    isPrimary: Boolean(row.is_primary),
    sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
    createdAt: row.created_at ? String(row.created_at) : undefined
  };
}

export function mapProductRow(
  row: Record<string, unknown>,
  imageRows: Array<Record<string, unknown>>,
  categoriesList: Category[]
): Product {
  const images = imageRows
    .map(mapProductImageRow)
    .filter((img) => img.imageUrl)
    .sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });

  const imageUrls = images.map((img) => img.imageUrl);
  const dbStatus = String(row.status ?? "available");
  const dbProductType = String(row.product_type ?? "ready_stock");
  const appStatus = mapDbStatusToAppStatus(dbStatus, dbProductType);
  const categoryId = row.category_id ? String(row.category_id) : undefined;

  return {
    id: String(row.id ?? `product-${Date.now()}`),
    name: String(row.name ?? "Untitled Product"),
    slug: row.slug ? String(row.slug) : undefined,
    description: String(row.description ?? ""),
    price: Number(row.price ?? 0),
    status: appStatus,
    category: mapCategoryIdToKind(categoryId, categoriesList),
    categoryId,
    batchId: row.batch_id ? String(row.batch_id) : undefined,
    agencyId: row.agency_id ? String(row.agency_id) : undefined,
    artistId: row.artist_id ? String(row.artist_id) : undefined,
    coupleId: row.couple_id ? String(row.couple_id) : undefined,
    coupleGender: undefined, // couple_gender is not in the DB schema
    image: imageUrls[0] ?? undefined,
    imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    stock: Number(row.stock ?? 0),
    weight: typeof row.weight === "number" ? row.weight : undefined,
    minDpRate: row.min_dp_rate != null ? Number(row.min_dp_rate) : undefined,
    productType: dbProductType as DbProductType,
    isFeatured: Boolean(row.is_featured),
    soldCount: typeof row.sold_count === "number" ? row.sold_count : undefined,
    viewCount: typeof row.view_count === "number" ? row.view_count : undefined,
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined
  };
}

// ---------------------------------------------------------------------------
// Category kind helper
// ---------------------------------------------------------------------------

function mapCategoryIdToKind(
  categoryId: string | undefined,
  categoriesList: Category[]
): ProductCategory {
  if (!categoryId) return "more";
  const category = categoriesList.find((c) => c.id === categoryId);
  if (!category) return "more";
  if (category.kind === "agency") return "agency";
  if (category.kind === "couple") return "couple";
  return "more";
}

// ---------------------------------------------------------------------------
// Slug generator
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "product";
  const suffix = Math.random().toString(36).slice(2, 8);
  const candidate = `${base}-${suffix}`;

  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("slug", candidate)
    .maybeSingle();

  if (!data) return candidate;

  // Very unlikely collision — add another suffix
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

/**
 * Fetch all products joined with product_images, ordered by created_at desc.
 */
export async function fetchProducts(categoriesList: Category[] = []): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  if (!Array.isArray(data) || data.length === 0) return [];

  return data.map((row) => {
    const images = Array.isArray(row.product_images) ? row.product_images : [];
    return mapProductRow(row as Record<string, unknown>, images, categoriesList);
  });
}

/**
 * Create a new product and its images in Supabase.
 * Requires at minimum: name, price, product_type (derived from status), categoryId.
 */
export async function createProduct(
  product: Omit<Product, "id" | "createdAt" | "updatedAt">,
  images: ProductImageInput[] = []
): Promise<Product> {
  if (!product.categoryId) {
    throw new Error("categoryId is required to create a product.");
  }
  if (!product.name?.trim()) {
    throw new Error("Product name is required.");
  }
  if (product.price == null || product.price < 0) {
    throw new Error("A valid price is required.");
  }

  const { status: dbStatus, product_type } = mapAppStatusToDb(product.status);
  const slug = await generateUniqueSlug(product.name);

  const { data: inserted, error: insertError } = await supabase
    .from("products")
    .insert({
      category_id: product.categoryId,
      batch_id: product.batchId ?? null,
      agency_id: product.agencyId ?? null,
      artist_id: product.artistId ?? null,
      couple_id: product.coupleId ?? null,
      name: product.name.trim(),
      slug,
      description: product.description ?? null,
      price: product.price,
      min_dp_rate: product.minDpRate ?? null,
      stock: product.stock ?? 0,
      weight: product.weight ?? 0,
      product_type,
      status: dbStatus,
      is_featured: product.isFeatured ?? false
    })
    .select("*, product_images(*)")
    .single();

  if (insertError) throw insertError;
  if (!inserted) throw new Error("Failed to insert product.");

  if (images.length > 0) {
    const imageRows = images.map((img, idx) => ({
      product_id: inserted.id,
      image_url: img.imageUrl,
      alt_text: img.altText ?? null,
      is_primary: img.isPrimary ?? idx === 0,
      sort_order: img.sortOrder ?? idx
    }));

    const { error: imgError } = await supabase
      .from("product_images")
      .insert(imageRows);

    if (imgError) throw imgError;
  }

  // Re-fetch to get images
  const { data: full, error: fetchErr } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("id", inserted.id)
    .single();

  if (fetchErr) throw fetchErr;

  const finalImages = Array.isArray(full.product_images) ? full.product_images : [];
  return mapProductRow(full as Record<string, unknown>, finalImages, []);
}

/**
 * Update an existing product row and optionally reconcile its images.
 * If `images` is provided, it fully replaces the existing product_images rows.
 */
export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, "id" | "createdAt">>,
  images?: ProductImageInput[]
): Promise<Product> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };

  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.slug !== undefined) payload.slug = updates.slug;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.price !== undefined) payload.price = updates.price;
  if (updates.stock !== undefined) payload.stock = updates.stock;
  if (updates.weight !== undefined) payload.weight = updates.weight;
  if (updates.minDpRate !== undefined) payload.min_dp_rate = updates.minDpRate;
  if (updates.isFeatured !== undefined) payload.is_featured = updates.isFeatured;
  if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
  if (updates.batchId !== undefined) payload.batch_id = updates.batchId;
  if (updates.agencyId !== undefined) payload.agency_id = updates.agencyId;
  if (updates.artistId !== undefined) payload.artist_id = updates.artistId;
  if (updates.coupleId !== undefined) payload.couple_id = updates.coupleId;

  if (updates.status !== undefined) {
    const { status: dbStatus, product_type } = mapAppStatusToDb(updates.status);
    payload.status = dbStatus;
    payload.product_type = product_type;
  }

  const { error: updateError } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id);

  if (updateError) throw updateError;

  if (images !== undefined) {
    await syncProductImages(id, images);
  }

  // Re-fetch updated row
  const { data: full, error: fetchErr } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("id", id)
    .single();

  if (fetchErr) throw fetchErr;

  const finalImages = Array.isArray(full.product_images) ? full.product_images : [];
  return mapProductRow(full as Record<string, unknown>, finalImages, []);
}

/**
 * Delete a product by id. product_images rows cascade automatically via FK.
 */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Image sync helper (mirrors syncUserAddresses pattern from auth-service.ts)
// ---------------------------------------------------------------------------

async function syncProductImages(
  productId: string,
  images: ProductImageInput[]
): Promise<void> {
  // Delete all existing images for this product, then re-insert
  const { error: delError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);

  if (delError) throw delError;

  if (images.length === 0) return;

  const rows = images.map((img, idx) => ({
    product_id: productId,
    image_url: img.imageUrl,
    alt_text: img.altText ?? null,
    is_primary: img.isPrimary ?? idx === 0,
    sort_order: img.sortOrder ?? idx
  }));

  const { error: insertError } = await supabase
    .from("product_images")
    .insert(rows);

  if (insertError) throw insertError;
}
