"use client"

import React, { useState } from "react"
import { FormModal } from "@/components/Modal"
import { getProductFields } from "@/fields/productFields"
import { productSchema, type ProductFormValues } from "@/schema/productSchema"
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useProduct"
import { useCategories } from "@/hooks/useCategory"
import { useAgencies } from "@/hooks/useAgency"
import { useCouples } from "@/hooks/useCouple"
import { useBatches } from "@/hooks/useBatch"
import type { Product } from "@/services/product.service"
import { DataTable } from "@/components/table/DataTable"
import { getProductColumns } from "@/columns/productColumns"

export default function ProductsPage() {
  const { data: products = [], isLoading } = useProducts()
  const { data: categories = [] } = useCategories()
  const { data: agencies = [] } = useAgencies()
  const { data: couples = [] } = useCouples()
  const { data: batches = [] } = useBatches()

  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [search, setSearch] = useState("")

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }))
  const agencyOptions = agencies.map((a) => ({ label: a.name, value: a.id }))
  const coupleOptions = couples.map((c) => ({ label: c.name, value: c.id }))
  const batchOptions = batches.map((b) => ({ label: b.name, value: b.id }))

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditing(null)
  }

  const handleSubmit = async (data: any) => {
    const payload = {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      price: Number(data.price),
      stock: Number(data.stock) || 0,
      weight: Number(data.weight) || 0,
      min_dp_rate: data.min_dp_rate != null ? Number(data.min_dp_rate) : null,
      product_type: data.product_type,
      status: data.status || "available",
      is_featured: Boolean(data.is_featured),
      category_id: data.category_id,
      batch_id: data.batch_id || null,
      agency_id: data.agency_id || null,
      artist_id: data.artist_id || null,
      couple_id: data.couple_id || null,
    }

    if (editing) {
      updateProduct.mutate({ id: editing.id, payload }, { onSuccess: handleClose })
    } else {
      createProduct.mutate(payload as any, { onSuccess: handleClose })
    }
  }

  const handleDeleteById = (id: string) => {
    if (!confirm("Delete this product?")) return
    deleteProduct.mutate(id, { onSuccess: handleClose })
  }

  const handleDeleteEditing = () => {
    if (!editing) return
    if (!confirm("Delete this product?")) return
    deleteProduct.mutate(editing.id, { onSuccess: handleClose })
  }

  const isPending =
    createProduct.isPending || updateProduct.isPending

  return (
    <div>
      <DataTable
        title="Products"
        description="Manage products in the store"
        columns={getProductColumns(openEdit, (p) => handleDeleteById(p.id))}
        data={products}
        search={{
          value: search,
          onChange: setSearch,
          columnId: "name",
          placeholder: "Search products...",
        }}
        addButton={{
          label: "Add Product",
          onClick: openCreate,
        }}
        noDataMessage="No products yet"
      />

      <FormModal
        open={modalOpen}
        onOpenChange={(open) => { if (!open) handleClose() }}
        title={editing ? "Edit Product" : "Add Product"}
        fields={getProductFields(categoryOptions, batchOptions, agencyOptions, coupleOptions)}
        schema={productSchema}
        onSubmit={handleSubmit}
        onDelete={editing ? handleDeleteEditing : undefined}
        defaultValues={editing ?? undefined}
        submitLabel={editing ? "Save changes" : "Create"}
        deleteLabel="Delete Product"
        loading={isPending}
        formMode={editing ? "edit" : "create"}
        formKey={editing?.id ?? "create"}
        size="3xl"
      />
    </div>
  )
}
