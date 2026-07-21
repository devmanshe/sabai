"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Product } from "@/services/product.service"

export const getProductColumns = (
  onEdit: (product: Product) => void,
  onDelete: (product: Product) => void
): ColumnDef<Product>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-semibold text-[#2d4f79]">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <span className="text-xs text-[#6f84a3]">{row.original.slug}</span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => row.original.category?.name ?? "—",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) =>
      `Rp ${row.original.price.toLocaleString("id-ID")}`,
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "product_type",
    header: "Type",
    cell: ({ row }) =>
      row.original.product_type === "ready_stock" ? "Ready Stock" : "Pre Order",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusMap = {
        available: "bg-green-100 text-green-800",
        sold_out: "bg-red-100 text-red-800",
        inactive: "bg-gray-100 text-gray-600",
      }
      const cls = statusMap[row.original.status] ?? "bg-gray-100 text-gray-600"
      return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
          {row.original.status}
        </span>
      )
    },
  },
  {
    accessorKey: "is_featured",
    header: "Featured",
    cell: ({ row }) => (row.original.is_featured ? "✓" : "—"),
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex gap-2">
        <button className="btn-ghost" onClick={() => onEdit(row.original)}>
          Edit
        </button>
        <button className="btn-danger" onClick={() => onDelete(row.original)}>
          Delete
        </button>
      </div>
    ),
  },
]
