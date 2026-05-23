"use client";

import { useApp } from "@/lib/store";
import { useState, useMemo } from "react";
import { RequireRole } from "@/components/Protected";

export default function ProductsPage() {
  const { products, categories, addProduct, editProduct, deleteProduct } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "agency" as const,
    agencyId: "",
    coupleGender: "boys" as "boys" | "girls",
    status: "instock" as const,
    deadline: ""
  });

  const agencies = useMemo(
    () => categories.filter((entry) => entry.kind === "agency"),
    [categories]
  );

  const genderFilters = useMemo(
    () => categories.filter((entry) => entry.kind === "gender"),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.id.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [products, searchText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agencyId) {
      return;
    }

    if (editingId) {
      editProduct(editingId, {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined
      });
      setEditingId(null);
    } else {
      addProduct({
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined
      });
    }
    setFormData({
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "agency",
      agencyId: agencies[0]?.id || "",
      coupleGender: "boys",
      status: "instock",
      deadline: ""
    });
    setShowForm(false);
  };

  const handleEdit = (product: typeof products[0]) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      agencyId: product.agencyId || "",
      coupleGender: product.coupleGender || "boys",
      status: product.status,
      deadline: product.deadline ? new Date(product.deadline).toISOString().split("T")[0] : ""
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "agency",
      agencyId: agencies[0]?.id || "",
      coupleGender: "boys",
      status: "instock",
      deadline: ""
    });
  };

  return (
    <RequireRole roles={["superadmin"]}>
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">📦 Products Management</h1>
          <p className="text-sm text-text">Kelola semua produk yang dijual di Sabai Merch</p>
        </div>

        <div className="surface-card p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="input-field"
          />
          <button onClick={() => setShowForm(true)} className="btn-primary">
            ➕ Tambah Produk
          </button>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
              <h2 className="text-2xl font-semibold">{editingId ? "Edit Product" : "Add New Product"}</h2>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold">Nama Produk</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold">Deskripsi</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold">Harga ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="input-field mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold">Stok</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      className="input-field mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold">Kategori Utama</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="input-field mt-1"
                    >
                      <option value="agency">Agency</option>
                      <option value="couple">Couple</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="input-field mt-1"
                    >
                      <option value="instock">In Stock</option>
                      <option value="preorder">Pre-order</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold">
                      {formData.category === "couple" ? "Agency Parent" : "Agency"}
                    </label>
                    <select
                      value={formData.agencyId}
                      onChange={(e) => setFormData({ ...formData, agencyId: e.target.value })}
                      className="input-field mt-1"
                      required
                    >
                      <option value="">Pilih Agency</option>
                      {agencies.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.category === "couple" ? (
                    <div>
                      <label className="block text-sm font-semibold">More (Gender Filter)</label>
                      <select
                        value={formData.coupleGender}
                        onChange={(e) => setFormData({ ...formData, coupleGender: e.target.value as "boys" | "girls" })}
                        className="input-field mt-1"
                      >
                        {genderFilters.map((entry) => (
                          <option key={entry.id} value={entry.id === "gender-girls" ? "girls" : "boys"}>
                            {entry.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-ink/20 bg-ice/20 px-4 py-3 text-xs text-text">
                      More dipakai khusus buat filter gender pada kategori Couple.
                    </div>
                  )}
                </div>

                {formData.status === "preorder" && (
                  <div>
                    <label className="block text-sm font-semibold">Deadline Preorder</label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="input-field mt-1"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingId ? "Update Product" : "Tambah Produk"}
                  </button>
                  <button type="button" onClick={handleCancel} className="btn-ghost flex-1">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="soft-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-ink/10 bg-ice">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Agency</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">More</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Deadline</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-ink/5 hover:bg-ice/50">
                    <td className="px-4 py-3 text-sm font-mono">{product.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-sm capitalize">{product.category}</td>
                    <td className="px-4 py-3 text-sm">
                      {agencies.find((agency) => agency.id === product.agencyId)?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{product.coupleGender || "-"}</td>
                    <td className="px-4 py-3 text-sm">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-bold ${
                          product.stock > 20
                            ? "bg-green-100 text-green-800"
                            : product.stock > 0
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-bold ${
                          product.status === "instock"
                            ? "bg-green-100 text-green-800"
                            : product.status === "preorder"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {product.deadline
                        ? new Date(product.deadline).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="btn-ghost text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="btn-ghost text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="p-6 text-center text-text">Tidak ada produk ditemukan.</div>
          )}
        </div>
      </section>
    </RequireRole>
  );
}
