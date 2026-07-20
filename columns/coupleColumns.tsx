"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Couple } from "@/type/couple.type"

export const getCoupleColumns = (
  onEdit: (couple: Couple) => void,
  onDelete: (couple: Couple) => void
): ColumnDef<Couple>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "agency",
    header: "Agency",
    cell: ({ row }) => row.original.agency?.name ?? "Independent",
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex gap-2">
        <button className="btn-ghost" onClick={() => onEdit(row.original)}>Edit</button>
        <button className="btn-danger" onClick={() => onDelete(row.original)}>Delete</button>
      </div>
    ),
  },
]