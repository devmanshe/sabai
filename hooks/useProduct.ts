import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  productService,
  type CreateProductPayload,
  type UpdateProductPayload,
} from "@/services/product.service"
import { toast } from "sonner"

const PRODUCT_KEY = ["products"]

export const useProducts = () =>
  useQuery({
    queryKey: PRODUCT_KEY,
    queryFn: productService.getAll,
  })

export const useProduct = (id: string) =>
  useQuery({
    queryKey: [...PRODUCT_KEY, id],
    queryFn: () => productService.getById(id),
    enabled: Boolean(id),
  })

export const useCreateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateProductPayload) =>
      productService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCT_KEY })
      toast.success("Product created")
    },
    onError: (err: any) =>
      toast.error(err.message || "Failed to create product"),
  })
}

export const useUpdateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateProductPayload
    }) => productService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCT_KEY })
      toast.success("Product updated")
    },
    onError: (err: any) =>
      toast.error(err.message || "Failed to update product"),
  })
}

export const useDeleteProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCT_KEY })
      toast.success("Product deleted")
    },
    onError: (err: any) =>
      toast.error(err.message || "Failed to delete product"),
  })
}
