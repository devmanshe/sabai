import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { agencyService } from "@/services/agency.service"
import type { CreateAgencyPayload, UpdateAgencyPayload } from "@/type/couple.type"
import { toast } from "sonner"

const AGENCY_KEY = ["agency"]

export const useAgencies = () =>
  useQuery({
    queryKey: AGENCY_KEY,
    queryFn: agencyService.getAll,
  })

export const useAgency = (id: string) =>
  useQuery({
    queryKey: [...AGENCY_KEY, id],
    queryFn: () => agencyService.getById(id),
    enabled: Boolean(id),
  })

export const useCreateAgency = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAgencyPayload) => agencyService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AGENCY_KEY })
      toast.success("Agency created")
    },
    onError: (err: any) => toast.error(err.message || "Failed to create agency"),
  })
}

export const useUpdateAgency = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAgencyPayload }) =>
      agencyService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AGENCY_KEY })
      toast.success("Agency updated")
    },
    onError: (err: any) => toast.error(err.message || "Failed to update agency"),
  })
}

export const useDeleteAgency = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => agencyService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AGENCY_KEY })
      toast.success("Agency deleted")
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete agency"),
  })
}