import { supabaseBrowser } from "@/lib/supabaseBrowser"

// NOTE: Schema assumption — table `batches` with columns:
// id UUID, name VARCHAR, description TEXT, start_date DATE, end_date DATE, created_at TIMESTAMPTZ
// Adjust if the actual schema differs.

export interface Batch {
  id: string
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
}

export type CreateBatchPayload = Omit<Batch, "id" | "created_at">
export type UpdateBatchPayload = Partial<CreateBatchPayload>

export const batchService = {
  async getAll(): Promise<Batch[]> {
    const { data, error } = await supabaseBrowser
      .from("batches")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) throw error
    return data
  },

  async getById(id: string): Promise<Batch> {
    const { data, error } = await supabaseBrowser
      .from("batches")
      .select("*")
      .eq("id", id)
      .single()
    if (error) throw error
    return data
  },

  async create(payload: CreateBatchPayload): Promise<Batch> {
    const { data, error } = await supabaseBrowser
      .from("batches")
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, payload: UpdateBatchPayload): Promise<Batch> {
    const { data, error } = await supabaseBrowser
      .from("batches")
      .update(payload)
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabaseBrowser
      .from("batches")
      .delete()
      .eq("id", id)
    if (error) throw error
  },
}
