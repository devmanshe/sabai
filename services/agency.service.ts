import { supabaseBrowser } from "@/lib/supabaseBrowser"
import type { Agency, CreateAgencyPayload, UpdateAgencyPayload } from "@/type/couple.type"
export const agencyService = {
    async getAll(): Promise<Agency[]>{
        const {data, error} = await supabaseBrowser
        .from("agency")
        .select("*")
        .order("agency_name")
        if (error) throw error
        return data
    },

    async getById(id: string): Promise<Agency>{
        const {data, error} = await supabaseBrowser
            .from("agency")
            .select("*")
            .eq("id", id)
            .single()
        if (error) throw error
        return data
    },

    async create(payload: CreateAgencyPayload): Promise<Agency>{
        const {data, error} = await supabaseBrowser
            .from("agency")
            .insert(payload)
            .select()
            .single()
        if (error) throw error
        return data
    },

    async update(id: string, payload: UpdateAgencyPayload): Promise<Agency>{
        const {data, error} = await supabaseBrowser
            .from("agency")
            .update(payload)
            .eq("id", id)
            .select()
            .single()
        if(error) throw error
        return data
    },

    async delete(id: string): Promise<void>{
        const {error} = await supabaseBrowser
            .from("agency")
            .delete()
            .eq("id", id)
        if (error) throw error
    }
}