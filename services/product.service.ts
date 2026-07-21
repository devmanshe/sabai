import { supabaseBrowser } from "@/lib/supabaseBrowser"

export interface Product {
  id: string
  category_id: string
  batch_id: string | null
  agency_id: string | null
  artist_id: string | null
  couple_id: string | null
  name: string
  slug: string
  description: string | null
  price: number
  min_dp_rate: number | null
  stock: number
  weight: number
  product_type: "ready_stock" | "pre_order"
  status: "available" | "sold_out" | "inactive"
  is_featured: boolean
  sold_count: number
  view_count: number
  created_at: string
  updated_at: string
  // Joined relations
  category?: { id: string; name: string } | null
}

export type CreateProductPayload = Omit<
  Product,
  "id" | "created_at" | "updated_at" | "sold_count" | "view_count" | "category"
>
export type UpdateProductPayload = Partial<CreateProductPayload>

export const productService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabaseBrowser
      .from("products")
      .select("*, category:categories(id, name)")
      .order("created_at", { ascending: false })
    if (error) throw error
    return data
  },

  async getById(id: string): Promise<Product> {
    const { data, error } = await supabaseBrowser
      .from("products")
      .select("*, category:categories(id, name)")
      .eq("id", id)
      .single()
    if (error) throw error
    return data
  },

  async create(payload: CreateProductPayload): Promise<Product> {
    const { data, error } = await supabaseBrowser
      .from("products")
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, payload: UpdateProductPayload): Promise<Product> {
    const { data, error } = await supabaseBrowser
      .from("products")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabaseBrowser
      .from("products")
      .delete()
      .eq("id", id)
    if (error) throw error
  },
}
