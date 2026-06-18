import {z} from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),

  password: z
    .string()
    .min(1, "Password wajib diisi"),
})

export const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    username: z.string().min(3, "Username must be at least 3 characters")
            .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    phone: z.string().min(1, "Phone number is required")
            .regex(/^[0-9+\-\s]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string().min(1, "Email is required")
            .email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters")
        .regex(/^[a-zA-Z]/, "Username can only contain letters, numbers, and underscores")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirm: z
      .string()
      .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>