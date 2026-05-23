"use client";

import { useApp } from "@/lib/store";
import { useMemo, useState } from "react";
import { RequireRole } from "@/components/Protected";

export default function CategoriesPage() {
  const { categories, addCategory, editCategory, deleteCategory } = useApp();
  const [activeForm, setActiveForm] = useState<"agency" | "couple" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    kind: "agency" as "agency" | "couple",
    name: "",
    description: "",
    parentId: ""
  });

  const agencies = useMemo(
    () => categories.filter((entry) => entry.kind === "agency"),
    [categories]
  );
  const couples = useMemo(
    () => categories.filter((entry) => entry.kind === "couple"),
    [categories]
  );
  const genders = useMemo(
    () => categories.filter((entry) => entry.kind === "gender"),
    [categories]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      editCategory(editingId, formData);
      setEditingId(null);
    } else {
      addCategory(formData);
    }
    setFormData({ kind: "agency", name: "", description: "", parentId: "" });
    setActiveForm(null);
  };

  const handleEdit = (category: typeof categories[0]) => {
    setFormData({
      kind: category.kind as "agency" | "couple",
      name: category.name,
      description: category.description || "",
      parentId: category.parentId || ""
    });
    setEditingId(category.id);
    setActiveForm(category.kind === "couple" ? "couple" : "agency");
  };

  const handleCancel = () => {
    setActiveForm(null);
    setEditingId(null);
    setFormData({ kind: "agency", name: "", description: "", parentId: "" });
  };

  const agencyNameById = (id?: string) => {
    if (!id) return "-";
    return agencies.find((agency) => agency.id === id)?.name ?? "Unknown Agency";
  };

  return (
    <RequireRole roles={["superadmin"]}>
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">🏷️ Categories Management</h1>
          <p className="text-sm text-text">
            Struktur kategori: Agency (dinamis), Couple (terhubung ke Agency), dan More (filter gender).
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <button
            onClick={() => {
              setActiveForm("agency");
              setEditingId(null);
              setFormData({ kind: "agency", name: "", description: "", parentId: "" });
            }}
            className="btn-primary"
          >
            ➕ Tambah Agency
          </button>
          <button
            onClick={() => {
              setActiveForm("couple");
              setEditingId(null);
              setFormData({ kind: "couple", name: "", description: "", parentId: agencies[0]?.id || "" });
            }}
            className="btn-secondary"
          >
            ➕ Tambah Couple
          </button>
        </div>

        {(activeForm === "agency" || activeForm === "couple") && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6">
              <h2 className="text-2xl font-semibold">
                {editingId
                  ? `Edit ${activeForm === "couple" ? "Couple" : "Agency"}`
                  : `Add ${activeForm === "couple" ? "New Couple" : "New Agency"}`}
              </h2>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold">Nama</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field mt-1"
                  />
                </div>

                {activeForm === "couple" && (
                  <div>
                    <label className="block text-sm font-semibold">Agency Parent</label>
                    <select
                      required
                      value={formData.parentId}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      className="input-field mt-1"
                    >
                      {agencies.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold">Deskripsi</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingId ? "Update" : "Tambah"}
                  </button>
                  <button type="button" onClick={handleCancel} className="btn-ghost flex-1">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="soft-panel p-5">
            <h3 className="text-lg font-semibold text-ink">Agency</h3>
            <p className="mt-1 text-xs text-text">Super admin bisa tambah/hapus agency aktif.</p>
            <div className="mt-4 space-y-3">
              {agencies.map((agency) => (
                <div key={agency.id} className="rounded-xl border border-ink/10 bg-white p-3">
                  <p className="text-sm font-semibold text-ink">{agency.name}</p>
                  <p className="mt-1 text-xs text-text">{agency.description || "No description"}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => handleEdit(agency)} className="btn-ghost flex-1">✏️ Edit</button>
                    <button onClick={() => deleteCategory(agency.id)} className="btn-ghost flex-1 text-red-600">🗑️ Delete</button>
                  </div>
                </div>
              ))}
              {agencies.length === 0 && <p className="text-sm text-text">Belum ada agency.</p>}
            </div>
          </div>

          <div className="soft-panel p-5">
            <h3 className="text-lg font-semibold text-ink">Couple</h3>
            <p className="mt-1 text-xs text-text">Setiap couple wajib terhubung ke satu agency.</p>
            <div className="mt-4 space-y-3">
              {couples.map((couple) => (
                <div key={couple.id} className="rounded-xl border border-ink/10 bg-white p-3">
                  <p className="text-sm font-semibold text-ink">{couple.name}</p>
                  <p className="mt-1 text-xs text-text">Agency: {agencyNameById(couple.parentId)}</p>
                  <p className="mt-1 text-xs text-text">{couple.description || "No description"}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => handleEdit(couple)} className="btn-ghost flex-1">✏️ Edit</button>
                    <button onClick={() => deleteCategory(couple.id)} className="btn-ghost flex-1 text-red-600">🗑️ Delete</button>
                  </div>
                </div>
              ))}
              {couples.length === 0 && <p className="text-sm text-text">Belum ada couple.</p>}
            </div>
          </div>

          <div className="soft-panel p-5">
            <h3 className="text-lg font-semibold text-ink">More (Gender Filter)</h3>
            <p className="mt-1 text-xs text-text">
              Bagian More hanya untuk filter couple berdasarkan gender: boys/girls.
            </p>
            <div className="mt-4 space-y-3">
              {genders.map((gender) => (
                <div key={gender.id} className="rounded-xl border border-ink/10 bg-white p-3">
                  <p className="text-sm font-semibold text-ink">{gender.name}</p>
                  <p className="mt-1 text-xs text-text">{gender.description || "Gender filter"}</p>
                  <span className="mt-2 inline-block rounded-full bg-ice px-3 py-1 text-xs font-semibold text-ink">
                    Fixed
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {agencies.length === 0 && (
          <div className="soft-panel p-6 text-center text-text">Tambahkan minimal 1 agency dulu sebelum menambah couple.</div>
        )}
      </section>
    </RequireRole>
  );
}
