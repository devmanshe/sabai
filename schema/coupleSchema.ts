import {z} from "zod"

export const agencySchema = z.object({
    name: z.string().min(1, "Agency name is required"),
    description: z.string().nullable().optional(),
    logo_url: z.string().url("Must be a valid url").nullable().optional()
})

export const coupleSchema = z.object({
    name: z.string().min(1, "Couple name is required"),
    agency_id: z.string().uuid("Invalid agency").nullable().optional()
})

export type AgencyFormValues = z.infer<typeof agencySchema>
export type CoupleFormValues = z.infer<typeof coupleSchema>