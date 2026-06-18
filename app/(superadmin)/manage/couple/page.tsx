"use client"

import React, { useState } from "react"
import { FormModal } from "@/components/Modal"
import { coupleFields } from "@/fields/coupleFields"
import { coupleSchema, CoupleFormValues } from "@/schema/coupleSchema"
import {
  useCouples,
  useCreateCouple,
  useUpdateCouple,
  useDeleteCouple,
} from "@/hooks/useCouple"
import { useAgencies } from "@/hooks/useAgency"
import type { Couple } from "@/type/couple.type"
import { DataTable } from "@/components/table/DataTable"
import { getCoupleColumns } from "@/columns/coupleColumns"

// const emptyForm: CoupleFormValues = { name: "", agency_id: null }

export default function CouplesPage() {
  const { data: couples = [], isLoading } = useCouples()
//   const { data: agencies = [] } = useAgencies()
  const createCouple = useCreateCouple()
  const updateCouple = useUpdateCouple()
  const deleteCouple = useDeleteCouple()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Couple | null>(null)
  const [search, setSearch] = useState("")
  //   const [form, setForm] = useState<CoupleFormValues>(emptyForm)
//   const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (couple: Couple) => {
    setEditing(couple)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditing(null)

  }

  const handleSubmit = (data: any) => {
    const payload = {
      name: data.name,
      agency_id: data.agency_id ?? null,
    }

    if (editing) {
      updateCouple.mutate({ id: editing.id, payload }, { onSuccess: handleClose })
    } else {
      createCouple.mutate(payload, { onSuccess: handleClose })
    }
  }

    const handleDeleteById = (id: string) => {
    if (!confirm("Delete this agency")) return
    deleteCouple.mutate(id, {onSuccess: handleClose})
  }

  const handleDeleteEditing = () => {
    if(!editing) return
    if (!confirm("Delete this agency?")) return
    deleteCouple.mutate(editing.id, {onSuccess: handleClose})
  }

  // const handleDelete = async () => {
  //   if (!editing) return
  //   if(!confirm("Delete this agency?")) return
  //   deleteCouple.mutate(editing.id, {onSuccess: handleClose})
  // }

  const isPending = createCouple.isPending || updateCouple.isPending

  return (
    <div>

      <DataTable
        title="Couples"
        description="Manage couples and their agency"
        columns={getCoupleColumns(openEdit, (couple) => handleDeleteById(couple.id))}
        data={couples}
        search={{
          value: search,
          onChange: setSearch,
          columnId: "couple_name",
          placeholder: "Search couples"
        }}
        addButton={{
          label: "Add couple",
          onClick: openCreate
        }}
        noDataMessage="No Couples yet"
      />

      <FormModal
        open={modalOpen}
        onOpenChange={(open) => {if(!open) handleClose()}}
        title={editing ? "Edit Agency" : "Add Agency"}
        fields={coupleFields}
        schema={coupleSchema}
        onSubmit={handleSubmit}
        onDelete={editing ? handleDeleteEditing : undefined}
        defaultValues={editing ?? undefined}
        submitLabel={editing ? "Save changes" : "Create"}
        deleteLabel="Delete Agency"
        loading={isPending}
        formMode={editing ? "edit" : "create"}
        formKey={editing?.id ?? "create"}
      />
    </div>
  )
}