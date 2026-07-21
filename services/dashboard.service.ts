import { supabaseBrowser } from "@/lib/supabaseBrowser"

export const dashboardService = {
  async getUserCount(): Promise<number> {
    const { count, error } = await supabaseBrowser
      .from("profile")
      .select("*", { count: "exact", head: true })
    if (error) throw error
    return count ?? 0
  },

  async getProductCount(): Promise<number> {
    const { count, error } = await supabaseBrowser
      .from("products")
      .select("*", { count: "exact", head: true })
    if (error) throw error
    return count ?? 0
  },
}
