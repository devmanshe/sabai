"use client";

import { useApp } from "@/lib/store";
import { useState, useMemo } from "react";
import { RequireRole } from "@/components/Protected";

export default function UsersPage() {
  const { users, addUser, editUser, deleteUser, updateUserRole } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "user" | "admin" | "superadmin">("all");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    role: "user" as const,
    status: "active" as const
  });

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchText.toLowerCase()) ||
        u.email.toLowerCase().includes(searchText.toLowerCase()) ||
        u.username.toLowerCase().includes(searchText.toLowerCase());
      const matchesRole = filterRole === "all" || u.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchText, filterRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      editUser(editingId, formData);
      setEditingId(null);
    } else {
      addUser(formData);
    }
    setFormData({
      name: "",
      email: "",
      username: "",
      role: "user",
      status: "active"
    });
    setShowForm(false);
  };

  const handleEdit = (user: typeof users[0]) => {
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      username: "",
      role: "user",
      status: "active"
    });
  };

  return (
    <RequireRole roles={["superadmin"]}>
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">👥 Users Management</h1>
          <p className="text-sm text-text">Kelola akun pengguna dan hak akses</p>
        </div>

        <div className="surface-card p-4 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              type="text"
              placeholder="Cari user..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input-field"
            />
            <button onClick={() => setShowForm(true)} className="btn-primary">
              ➕ Tambah User
            </button>
          </div>
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="input-field"
            >
              <option value="all">Semua Role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
        </div>

        {/* User Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6">
              <h2 className="text-2xl font-semibold">{editingId ? "Edit User" : "Add New User"}</h2>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-semibold">Username</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="input-field mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="input-field mt-1"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="input-field mt-1"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingId ? "Update User" : "Tambah User"}
                  </button>
                  <button type="button" onClick={handleCancel} className="btn-ghost flex-1">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="soft-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-ink/10 bg-ice">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Nama</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Username</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-ink/5 hover:bg-ice/50">
                    <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm font-mono">{user.username}</td>
                    <td className="px-4 py-3 text-sm capitalize">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-bold ${
                          user.role === "superadmin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "admin"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-bold ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : user.status === "inactive"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(user.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="btn-ghost text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
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
          {filteredUsers.length === 0 && (
            <div className="p-6 text-center text-text">Tidak ada user ditemukan.</div>
          )}
        </div>
      </section>
    </RequireRole>
  );
}
