import { supabaseBrowser } from "@/lib/supabaseBrowser";
import type {
    Couple, CreateCouplePayload, UpdateCouplePayload,
} from "@/type/couple.type"

export const coupleService = {
  async getAll(): Promise<Couple[]> {
    const { data, error } = await supabaseBrowser
      .from("couple")
      .select("*, agency:agency(id, agency_name, logo_url)")
      .order("couple_name")
    if (error) throw error
    return data
  },

  async getById(id: string): Promise<Couple> {
    const { data, error } = await supabaseBrowser
      .from("couple")
      .select("*, agency:agency(id, agency_name, logo_url)")
      .eq("id", id)
      .single()
    if (error) throw error
    return data
  },

  async create(payload: CreateCouplePayload): Promise<Couple> {
    const { data, error } = await supabaseBrowser
      .from("couple")
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, payload: UpdateCouplePayload): Promise<Couple> {
    const { data, error } = await supabaseBrowser
      .from("couple")
      .update(payload)
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabaseBrowser
      .from("couple")
      .delete()
      .eq("id", id)
    if (error) throw error
  },
}