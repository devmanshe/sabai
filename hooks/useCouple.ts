import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { coupleService } from "@/services/couple.service"
import type { CreateCouplePayload, UpdateCouplePayload } from "@/type/couple.type"
import { toast } from "sonner"

const COUPLE_KEY = ["couple"]

export const useCouples = () =>
  useQuery({
    queryKey: COUPLE_KEY,
    queryFn: coupleService.getAll,
  })

export const useCouple = (id: string) =>
  useQuery({
    queryKey: [...COUPLE_KEY, id],
    queryFn: () => coupleService.getById(id),
    enabled: Boolean(id),
  })

export const useCreateCouple = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCouplePayload) => coupleService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COUPLE_KEY })
      toast.success("Couple created")
    },
    onError: (err: any) => toast.error(err.message || "Failed to create couple"),
  })
}

export const useUpdateCouple = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCouplePayload }) =>
      coupleService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COUPLE_KEY })
      toast.success("Couple updated")
    },
    onError: (err: any) => toast.error(err.message || "Failed to update couple"),
  })
}

export const useDeleteCouple = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => coupleService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COUPLE_KEY })
      toast.success("Couple deleted")
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete couple"),
  })
}