export interface Agency {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  created_at: string
}

export interface Couple {
  id: string
  name: string
  agency_id: string | null
  created_at: string
  agency?: Agency | null  // joined relation
}

// For forms
export type CreateAgencyPayload = Omit<Agency, "id" | "created_at">
export type UpdateAgencyPayload = Partial<CreateAgencyPayload>

export type CreateCouplePayload = Omit<Couple, "id" | "created_at" | "agency">
export type UpdateCouplePayload = Partial<CreateCouplePayload>