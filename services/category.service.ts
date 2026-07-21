import { supabaseBrowser } from "@/lib/supabaseBrowser"

export interface Category {
  id: string
  name: string
  slug: string | null
  description: string | null
  created_at: string
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabaseBrowser
      .from("categories")
      .select("id, name, slug, description, created_at")
      .order("name")
    if (error) throw error
    return data
  },
}
