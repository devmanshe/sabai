import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  batchService,
  type CreateBatchPayload,
  type UpdateBatchPayload,
} from "@/services/batch.service"
import { toast } from "sonner"

const BATCH_KEY = ["batches"]

export const useBatches = () =>
  useQuery({
    queryKey: BATCH_KEY,
    queryFn: batchService.getAll,
  })

export const useBatch = (id: string) =>
  useQuery({
    queryKey: [...BATCH_KEY, id],
    queryFn: () => batchService.getById(id),
    enabled: Boolean(id),
  })

export const useCreateBatch = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBatchPayload) => batchService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BATCH_KEY })
      toast.success("Batch created")
    },
    onError: (err: any) =>
      toast.error(err.message || "Failed to create batch"),
  })
}

export const useUpdateBatch = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateBatchPayload
    }) => batchService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BATCH_KEY })
      toast.success("Batch updated")
    },
    onError: (err: any) =>
      toast.error(err.message || "Failed to update batch"),
  })
}

export const useDeleteBatch = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => batchService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BATCH_KEY })
      toast.success("Batch deleted")
    },
    onError: (err: any) =>
      toast.error(err.message || "Failed to delete batch"),
  })
}
