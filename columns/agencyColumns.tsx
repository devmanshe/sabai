"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Agency } from "@/type/couple.type"

export const getAgencyColumns = (
  onEdit: (agency: Agency) => void,
  onDelete: (agency: Agency) => void
): ColumnDef<Agency>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.original.description ?? "—",
  },
  {
    accessorKey: "logo_url",
    header: "Logo",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.logo_url ? (
        <img
          src={row.original.logo_url}
          alt={row.original.name}
          className="h-8 w-8 rounded object-cover"
        />
      ) : "—",
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