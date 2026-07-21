import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().nullable().optional(),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  stock: z.coerce.number().int().min(0, "Stock must be >= 0").default(0),
  weight: z.coerce.number().int().min(0, "Weight must be >= 0").default(0),
  min_dp_rate: z.coerce
    .number()
    .min(0)
    .max(100)
    .nullable()
    .optional(),
  product_type: z.enum(["ready_stock", "pre_order"], {
    required_error: "Product type is required",
  }),
  status: z
    .enum(["available", "sold_out", "inactive"])
    .default("available"),
  is_featured: z.boolean().default(false),
  category_id: z.string().uuid("Category is required"),
  batch_id: z.string().uuid().nullable().optional(),
  agency_id: z.string().uuid().nullable().optional(),
  artist_id: z.string().uuid().nullable().optional(),
  couple_id: z.string().uuid().nullable().optional(),
})

export type ProductFormValues = z.infer<typeof productSchema>
