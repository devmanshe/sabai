"use client"

import React, { useState } from "react"
import { FormModal } from "@/components/Modal"
import { agencyFields } from "@/fields/agencyFields"
import { agencySchema, AgencyFormValues } from "@/schema/coupleSchema"
import {
  useAgencies,
  useCreateAgency,
  useUpdateAgency,
  useDeleteAgency,
} from "@/hooks/useAgency"
import type { Agency } from "@/type/couple.type"
import { DataTable } from "@/components/table/DataTable"
import { getAgencyColumns } from "@/columns/agencyColumns"

// const emptyForm = { name: "", description: "", logo_url: "" }

export default function AgenciesPage() {
  const { data: agencies = [], isLoading } = useAgencies()
  const createAgency = useCreateAgency()
  const updateAgency = useUpdateAgency()
  const deleteAgency = useDeleteAgency()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Agency | null>(null)
  const [search, setSearch] = useState("")
  //   const [form, setForm] = useState<AgencyFormValues>(emptyForm)
//   const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (agency: Agency) => {
    setEditing(agency)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditing(null)
  }

  const handleSubmit = async (data: any) => {
    const payload = {
      name: data.name,
      description: data.description ?? null,
      logo_url: data.logo_url ?? null,
    }

    if (editing) {
      updateAgency.mutate({ id: editing.id, payload }, { onSuccess: handleClose })
    } else {
      createAgency.mutate(payload, { onSuccess: handleClose })
    }
  }

  // const handleDelete = (id: string) => {
  //   if (!editing) return
  //   if(!confirm("Delete this agency?")) return
  //   deleteAgency.mutate(id, {onSuccess: handleClose})
  // }

  const handleDeleteById = (id: string) => {
    if (!confirm("Delete this agency")) return
    deleteAgency.mutate(id, {onSuccess: handleClose})
  }

  const handleDeleteEditing = () => {
    if(!editing) return
    if (!confirm("Delete this agency?")) return
    deleteAgency.mutate(editing.id, {onSuccess: handleClose})
  }

  const isPending = createAgency.isPending || updateAgency.isPending

  return (
    <div className="">

      <DataTable 
        title="Agencies"
        description="Manage agencies"
        columns={getAgencyColumns(openEdit, (agency) => handleDeleteById(agency.id))}
        data={agencies}
        search={{
          value: search,
          onChange: setSearch,
          columnId: "name",
          placeholder: "Search agencies...",
        }}
        addButton={{
          label: "Add Agency",
          onClick: openCreate
        }}
        noDataMessage="No agencies yet"
      />
      <FormModal
        open={modalOpen}
        onOpenChange={(open) => {if(!open) handleClose()}}
        title={editing ? "Edit Agency" : "Add Agency"}
        fields={agencyFields}
        schema={agencySchema}
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