"use client";

import { useEffect, useState } from "react";
import SiteShell from "@/components/SiteShell";
import { RequireAuth } from "@/components/Protected";
import AppToast from "@/components/AppToast";
import { useApp } from "@/lib/store";
import type { UserProfile } from "@/lib/types";

const emptyForm: UserProfile = {
  fullName: "",
  phone: "",
  address: "",
  province: "",
  city: "",
  postalCode: ""
};

export default function ProfilePage() {
  const { user, updateProfile, profileComplete } = useApp();
  const [form, setForm] = useState<UserProfile>(emptyForm);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(user.profile);
    }
  }, [user]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SiteShell>
      <RequireAuth>
        <AppToast
          open={saved}
          variant="success"
          title="Profile Tersimpan"
          message="Data profile kamu berhasil diperbarui."
          onClose={() => setSaved(false)}
          autoHideMs={2200}
        />
        <section className="profile-page">
          <aside className="profile-sidebar">
            <div className="profile-user-card">
              <div className="profile-avatar">{(user?.name || "S").slice(0, 1).toUpperCase()}</div>
              <div>
                <h2>{user?.name || "Sabai User"}</h2>
                <button type="button">+ Add Phone Number</button>
              </div>
            </div>

            <div className="profile-side-box">
              <h3>Wallet</h3>
              <ul>
                <li>
                  <span>GO Balance</span>
                  <strong>Rp0</strong>
                </li>
                <li>
                  <span>Member Level</span>
                  <strong>{profileComplete ? "Verified" : "Basic"}</strong>
                </li>
              </ul>
            </div>

            <div className="profile-side-box">
              <h3>Profile Menu</h3>
              <ul className="profile-menu-list">
                <li className="active">Biodata Diri</li>
                <li>Daftar Alamat</li>
                <li>Pembayaran</li>
                <li>Rekening Bank</li>
                <li>Notifikasi</li>
                <li>Keamanan</li>
              </ul>
            </div>
          </aside>

          <div className="profile-main">
            <div className="profile-header">
              <h1>{user?.name || "Sabai"}</h1>
              <span className={`profile-chip ${profileComplete ? "complete" : "incomplete"}`}>
                {profileComplete ? "Profile Complete" : "Incomplete Profile"}
              </span>
            </div>

            <div className="profile-tabs">
              <button type="button" className="active">Biodata Diri</button>
              <button type="button">Daftar Alamat</button>
              <button type="button">Pembayaran</button>
              <button type="button">Rekening Bank</button>
              <button type="button">Notifikasi</button>
              <button type="button">Mode Tampilan</button>
              <button type="button">Keamanan</button>
            </div>

            <div className="profile-content-card">
              <div className="profile-photo-panel">
                <div className="profile-photo-placeholder">{(user?.name || "S").slice(0, 1).toUpperCase()}</div>
                <button type="button" className="profile-outline-btn">Pilih Foto</button>
                <p>
                  Besar file maksimal 10 MB. Ekstensi file yang diperbolehkan: .JPG .JPEG .PNG
                </p>
                <button type="button" className="profile-outline-btn">Buat Kata Sandi</button>
                <button type="button" className="profile-outline-btn">PIN Sabai</button>
                <button type="button" className="profile-outline-btn">Verifikasi Instan</button>
              </div>

              <form onSubmit={handleSubmit} className="profile-form-panel">
                <h2>Ubah Biodata Diri</h2>

                <div className="profile-field-row">
                  <label>Nama</label>
                  <input
                    value={form.fullName}
                    onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                    placeholder="Full name"
                    required
                  />
                </div>

                <div className="profile-field-row">
                  <label>Tanggal Lahir</label>
                  <input placeholder="Tambah Tanggal Lahir" />
                </div>

                <div className="profile-field-row">
                  <label>Jenis Kelamin</label>
                  <input placeholder="Tambah Jenis Kelamin" />
                </div>

                <h3>Ubah Kontak</h3>

                <div className="profile-field-row">
                  <label>Email</label>
                  <input value={user?.email || ""} readOnly />
                </div>

                <div className="profile-field-row">
                  <label>Nomor HP</label>
                  <input
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    placeholder="Tambah Nomor HP"
                    required
                  />
                </div>

                <div className="profile-field-row full">
                  <label>Address</label>
                  <input
                    value={form.address}
                    onChange={(event) => setForm({ ...form, address: event.target.value })}
                    placeholder="Address"
                    required
                  />
                </div>

                <div className="profile-grid-fields">
                  <div className="profile-field-row full">
                    <label>Province</label>
                    <input
                      value={form.province}
                      onChange={(event) => setForm({ ...form, province: event.target.value })}
                      placeholder="Province"
                      required
                    />
                  </div>
                  <div className="profile-field-row full">
                    <label>City</label>
                    <input
                      value={form.city}
                      onChange={(event) => setForm({ ...form, city: event.target.value })}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div className="profile-field-row full">
                    <label>Postal Code</label>
                    <input
                      value={form.postalCode}
                      onChange={(event) => setForm({ ...form, postalCode: event.target.value })}
                      placeholder="Postal code"
                      required
                    />
                  </div>
                </div>

                <div className="profile-submit-wrap">
                  <button type="submit" className="profile-save-btn">Simpan Profile</button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </RequireAuth>
    </SiteShell>
  );
}
