"use client";

import { useApp } from "@/lib/store";
import { useState } from "react";
import { RequireRole } from "@/components/Protected";

export default function SettingsPage() {
  const { settings, updateSettings } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    storeName: settings.storeName,
    whatsappNumber: settings.whatsappNumber,
    contactEmail: settings.contactEmail,
    bankAccounts: settings.bankAccounts
  });
  const [newBank, setNewBank] = useState({
    bankName: "",
    accountNumber: "",
    accountName: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate save delay
    updateSettings(formData);
    setIsSaving(false);
  };

  const handleAddBank = () => {
    if (newBank.bankName && newBank.accountNumber && newBank.accountName) {
      setFormData({
        ...formData,
        bankAccounts: [...formData.bankAccounts, newBank]
      });
      setNewBank({
        bankName: "",
        accountNumber: "",
        accountName: ""
      });
    }
  };

  const handleRemoveBank = (index: number) => {
    setFormData({
      ...formData,
      bankAccounts: formData.bankAccounts.filter((_, i) => i !== index)
    });
  };

  return (
    <RequireRole roles={["superadmin"]}>
      <section className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-semibold">⚙️ Settings</h1>
          <p className="text-sm text-text">Kelola pengaturan toko Sabai Merch</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Information */}
          <div className="soft-panel p-6">
            <h2 className="text-lg font-semibold mb-4">📦 Informasi Toko</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold">Nama Toko</label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="input-field mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">Email Kontak</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="input-field mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">Nomor WhatsApp</label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="input-field mt-1"
                  placeholder="62812345678"
                />
              </div>
            </div>
          </div>

          {/* Bank Accounts */}
          <div className="soft-panel p-6">
            <h2 className="text-lg font-semibold mb-4">🏦 Rekening Pembayaran</h2>
            <div className="space-y-4">
              {/* Existing Banks */}
              <div className="space-y-3">
                {formData.bankAccounts.map((bank, idx) => (
                  <div key={idx} className="rounded-lg border border-ink/10 bg-ice p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-ink">{bank.bankName}</p>
                        <p className="text-sm text-text">{bank.accountNumber}</p>
                        <p className="text-sm text-text">Atas nama: {bank.accountName}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBank(idx)}
                        className="btn-ghost text-red-600"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Bank */}
              <div className="rounded-lg border-2 border-dashed border-ink/20 p-4">
                <h3 className="font-semibold text-sm mb-3">Tambah Rekening Baru</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nama Bank (e.g., BCA, Mandiri)"
                    value={newBank.bankName}
                    onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Nomor Rekening"
                    value={newBank.accountNumber}
                    onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Atas nama"
                    value={newBank.accountName}
                    onChange={(e) => setNewBank({ ...newBank, accountName: e.target.value })}
                    className="input-field"
                  />
                  <button
                    type="button"
                    onClick={handleAddBank}
                    className="btn-primary w-full"
                  >
                    ➕ Tambah Rekening
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary flex-1"
            >
              {isSaving ? "Menyimpan..." : "💾 Simpan Pengaturan"}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="soft-panel p-5 border border-blue-200 bg-blue-50">
          <h3 className="font-semibold text-blue-900">ℹ️ Informasi</h3>
          <p className="text-sm text-blue-800 mt-2">
            Semua perubahan pengaturan akan tersimpan otomatis dan mempengaruhi tampilan toko untuk pelanggan.
          </p>
        </div>
      </section>
    </RequireRole>
  );
}
