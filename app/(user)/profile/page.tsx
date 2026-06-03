"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SiteShell from "@/components/SiteShell";
import { RequireAuth } from "@/components/Protected";
import AppToast from "@/components/AppToast";
import { useApp } from "@/lib/store";
import type {
  AddressBookEntry,
  Gender,
  ProfileNotificationSettings,
  UserProfile
} from "@/lib/types";

const notificationDefaults: ProfileNotificationSettings = {
  emailStatusOrder: true,
  emailPayment: true,
  emailShipping: true,
  whatsappGo: true,
  whatsappArrived: true,
  whatsappLink: true
};

const provinceOptions = [
  "Aceh",
  "Bali",
  "Banten",
  "Bengkulu",
  "DI Yogyakarta",
  "DKI Jakarta",
  "Gorontalo",
  "Jambi",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "Kalimantan Barat",
  "Kalimantan Selatan",
  "Kalimantan Tengah",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Kepulauan Bangka Belitung",
  "Kepulauan Riau",
  "Lampung",
  "Maluku",
  "Maluku Utara",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Papua",
  "Papua Barat",
  "Papua Barat Daya",
  "Papua Pegunungan",
  "Papua Tengah",
  "Papua Selatan",
  "Riau",
  "Sulawesi Barat",
  "Sulawesi Selatan",
  "Sulawesi Tengah",
  "Sulawesi Tenggara",
  "Sulawesi Utara",
  "Sumatera Barat",
  "Sumatera Selatan",
  "Sumatera Utara"
];

const cityOptionsByProvince: Record<string, string[]> = {
  Aceh: ["Banda Aceh", "Lhokseumawe", "Langsa", "Sabang", "Meulaboh"],
  Bali: ["Denpasar", "Badung", "Gianyar", "Buleleng", "Karangasem"],
  Banten: ["Tangerang", "Tangerang Selatan", "Serang", "Cilegon", "Pandeglang", "Lebak"],
  Bengkulu: ["Bengkulu", "Rejang Lebong", "Kepahiang", "Mukomuko", "Seluma"],
  "DI Yogyakarta": ["Yogyakarta", "Sleman", "Bantul", "Kulon Progo", "Gunungkidul"],
  "DKI Jakarta": ["Jakarta Pusat", "Jakarta Utara", "Jakarta Barat", "Jakarta Selatan", "Jakarta Timur", "Kepulauan Seribu"],
  Gorontalo: ["Gorontalo", "Bone Bolango", "Boalemo", "Pohuwato", "Gorontalo Utara"],
  Jambi: ["Jambi", "Sungai Penuh", "Batanghari", "Muaro Jambi", "Tebo"],
  "Jawa Barat": ["Bandung", "Bekasi", "Bogor", "Depok", "Cimahi", "Sukabumi", "Cirebon", "Tasikmalaya", "Banjar"],
  "Jawa Tengah": ["Semarang", "Surakarta", "Salatiga", "Magelang", "Tegal", "Pekalongan", "Kendal", "Kudus", "Banyumas", "Cilacap"],
  "Jawa Timur": ["Surabaya", "Malang", "Kediri", "Blitar", "Madiun", "Mojokerto", "Probolinggo", "Pasuruan", "Sidoarjo", "Gresik", "Banyuwangi", "Jember"],
  "Kalimantan Barat": ["Pontianak", "Singkawang", "Ketapang", "Sanggau", "Sintang"],
  "Kalimantan Selatan": ["Banjarmasin", "Banjarbaru", "Martapura", "Kotabaru", "Amuntai"],
  "Kalimantan Tengah": ["Palangka Raya", "Kapuas", "Sampit", "Pangkalan Bun"],
  "Kalimantan Timur": ["Samarinda", "Balikpapan", "Bontang", "Tenggarong", "Sangatta"],
  "Kalimantan Utara": ["Tarakan", "Tanjung Selor", "Nunukan", "Malinau"],
  "Kepulauan Bangka Belitung": ["Pangkal Pinang", "Belitung", "Tanjung Pandan", "Sungailiat", "Muntok"],
  "Kepulauan Riau": ["Batam", "Tanjung Pinang", "Karimun", "Bintan", "Natuna"],
  Lampung: ["Bandar Lampung", "Metro", "Lampung Selatan", "Lampung Tengah", "Lampung Timur", "Pringsewu"],
  Maluku: ["Ambon", "Tual", "Masohi", "Dobo", "Namlea"],
  "Maluku Utara": ["Ternate", "Tidore Kepulauan", "Sofifi", "Tobelo", "Jailolo"],
  "Nusa Tenggara Barat": ["Mataram", "Bima", "Lombok Barat", "Lombok Tengah", "Lombok Timur", "Sumbawa"],
  "Nusa Tenggara Timur": ["Kupang", "Maumere", "Ende", "Atambua", "Ruteng", "Labuan Bajo"],
  Papua: ["Jayapura", "Merauke", "Timika", "Nabire", "Wamena", "Sentani"],
  "Papua Barat": ["Manokwari", "Sorong", "Fakfak", "Kaimana", "Raja Ampat"],
  "Papua Barat Daya": ["Sorong", "Sorong Selatan", "Raja Ampat", "Maybrat", "Tambrauw"],
  "Papua Pegunungan": ["Wamena", "Jayawijaya", "Yahukimo", "Tolikara", "Mamberamo Tengah"],
  "Papua Tengah": ["Nabire", "Timika", "Paniai", "Mimika", "Puncak Jaya"],
  "Papua Selatan": ["Merauke", "Boven Digoel", "Mappi", "Asmat"],
  Riau: ["Pekanbaru", "Dumai", "Bengkalis", "Siak", "Kampar"],
  "Sulawesi Barat": ["Mamuju", "Majene", "Polewali Mandar", "Pasangkayu", "Mamasa"],
  "Sulawesi Selatan": ["Makassar", "Parepare", "Palopo", "Gowa", "Maros", "Bone", "Bulukumba", "Sinjai", "Soppeng", "Takalar"],
  "Sulawesi Tengah": ["Palu", "Donggala", "Poso", "Luwuk", "Tolitoli", "Parigi"],
  "Sulawesi Tenggara": ["Kendari", "Baubau", "Kolaka", "Raha", "Konawe"],
  "Sulawesi Utara": ["Manado", "Bitung", "Tomohon", "Kotamobagu", "Minahasa"],
  "Sumatera Barat": ["Padang", "Bukittinggi", "Payakumbuh", "Solok", "Pariaman", "Sawahlunto"],
  "Sumatera Selatan": ["Palembang", "Prabumulih", "Lubuklinggau", "Pagar Alam", "Lahat", "Muara Enim"],
  "Sumatera Utara": ["Medan", "Binjai", "Pematangsiantar", "Sibolga", "Tebing Tinggi", "Tanjungbalai", "Kabanjahe"]
};

const genderOptions: Array<{ label: string; value: Gender | "" }> = [
  { label: "Pilih jenis kelamin", value: "" },
  { label: "Laki-laki", value: "male" },
  { label: "Perempuan", value: "female" },
  { label: "Lainnya", value: "other" },
  { label: "Tidak ingin menyebutkan", value: "prefer_not_to_say" }
];

const sanitizeDigits = (value: string) => value.replace(/\D/g, "");

const formatBirthDate = (value?: string | null) => {
  if (!value) return "Belum diisi";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(parsed);
};

const makeEmptyAddress = (label = "Rumah"): AddressBookEntry => ({
  id: `addr-${Date.now()}`,
  label,
  recipientName: "",
  phone: "",
  address: "",
  province: "",
  city: "",
  postalCode: "",
  isDefault: false
});

const emptyForm: UserProfile = {
  fullName: "",
  phone: "",
  address: "",
  province: "",
  city: "",
  postalCode: "",
  avatarUrl: null,
  avatarName: null,
  birthDate: null,
  gender: "",
  defaultAddressId: null,
  addressBook: [],
  notifications: notificationDefaults
};

const emptyPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
};

type ToastState = {
  open: boolean;
  variant: "success" | "error";
  title: string;
  message: string;
};

const initialToast: ToastState = {
  open: false,
  variant: "success",
  title: "",
  message: ""
};

const passwordRule = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function ProfilePage() {
  const { user, updateProfile, profileComplete } = useApp();
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<UserProfile>(emptyForm);
  const [toast, setToast] = useState<ToastState>(initialToast);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [addressOpen, setAddressOpen] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressBookEntry>(makeEmptyAddress());
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"biodata" | "alamat" | "pembayaran" | "notifikasi" | "keamanan">("biodata");

  useEffect(() => {
    if (!user) return;
    setForm({
      ...emptyForm,
      ...user.profile,
      addressBook: user.profile.addressBook?.length ? user.profile.addressBook : [],
      notifications: {
        ...notificationDefaults,
        ...(user.profile.notifications ?? {})
      }
    });
  }, [user]);

  const cityOptions = useMemo(() => cityOptionsByProvince[form.province] ?? [], [form.province]);

  const primaryAddress = useMemo(() => {
    const addressBook = form.addressBook ?? [];
    if (!addressBook.length) return null;
    return addressBook.find((address) => address.isDefault) ?? addressBook[0] ?? null;
  }, [form.addressBook]);

  const openToast = (variant: ToastState["variant"], title: string, message: string) => {
    setToast({ open: true, variant, title, message });
  };

  const closeToast = () => setToast((prev) => ({ ...prev, open: false }));

  const handlePhotoPick = () => {
    photoInputRef.current?.click();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      openToast("error", "Format tidak didukung", "Gunakan file JPG, JPEG, atau PNG.");
      event.target.value = "";
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      openToast("error", "File terlalu besar", "Ukuran file maksimal 10 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        avatarUrl: typeof reader.result === "string" ? reader.result : null,
        avatarName: file.name
      }));
      openToast("success", "Foto diperbarui", "Preview foto profil sudah disimpan di browser.");
    };
    reader.readAsDataURL(file);
  };

  const handleProvinceChange = (province: string) => {
    const options = cityOptionsByProvince[province] ?? [];
    setForm((prev) => ({
      ...prev,
      province,
      city: options.includes(prev.city) ? prev.city : options[0] ?? ""
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Basic validations
    const rawPhone = sanitizeDigits(form.phone);
    let normalizedPhone = rawPhone;
    if (rawPhone.startsWith("62")) normalizedPhone = "0" + rawPhone.slice(2);
    else if (rawPhone.startsWith("8")) normalizedPhone = "0" + rawPhone;

    if (normalizedPhone.length < 9 || normalizedPhone.length > 15) {
      openToast("error", "Nomor HP tidak valid", "Masukkan nomor HP Indonesia (9-15 digit). Contoh: 08123456789");
      return;
    }

    const postal = sanitizeDigits(form.postalCode).slice(0, 5);
    if (postal.length !== 5) {
      openToast("error", "Kode pos tidak valid", "Kode pos harus 5 digit.");
      return;
    }

    if (form.birthDate) {
      const d = new Date(form.birthDate);
      const now = new Date();
      if (Number.isNaN(d.getTime()) || d > now) {
        openToast("error", "Tanggal lahir tidak valid", "Pilih tanggal lahir yang benar (bukan masa depan).");
        return;
      }
    }

    const nextProfile: UserProfile = {
      ...form,
      phone: normalizedPhone,
      postalCode: postal,
      addressBook: (form.addressBook ?? []).map((address) => ({
        ...address,
        phone: sanitizeDigits(address.phone),
        postalCode: sanitizeDigits(address.postalCode).slice(0, 5)
      })),
      notifications: {
        ...notificationDefaults,
        ...(form.notifications ?? {})
      }
    };

    updateProfile(nextProfile);
    setForm(nextProfile);
    openToast("success", "Profile tersimpan", "Data biodata dan alamat utama berhasil diperbarui.");
  };

  const openAddressModal = (address?: AddressBookEntry) => {
    if (address) {
      setEditingAddressId(address.id);
      setAddressForm({ ...address });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        ...makeEmptyAddress(),
        recipientName: form.fullName,
        phone: form.phone,
        address: form.address,
        province: form.province,
        city: form.city,
        postalCode: form.postalCode,
        isDefault: !form.addressBook?.length
      });
    }
    setAddressOpen(true);
  };

  const closeAddressModal = () => {
    setAddressOpen(false);
    setEditingAddressId(null);
  };

  const handleSaveAddress = () => {
    if (!addressForm.label.trim() || !addressForm.address.trim() || !addressForm.province.trim() || !addressForm.city.trim() || !addressForm.postalCode.trim()) {
      openToast("error", "Alamat belum lengkap", "Lengkapi label, alamat, provinsi, kota, dan kode pos.");
      return;
    }

    // Validate phone and postal code for the address
    const rawPhone = sanitizeDigits(addressForm.phone || "");
    let normalizedPhone = rawPhone;
    if (rawPhone.startsWith("62")) normalizedPhone = "0" + rawPhone.slice(2);
    else if (rawPhone.startsWith("8")) normalizedPhone = "0" + rawPhone;

    if (normalizedPhone && (normalizedPhone.length < 9 || normalizedPhone.length > 15)) {
      openToast("error", "Nomor HP tidak valid", "Masukkan nomor HP Indonesia (9-15 digit). Contoh: 08123456789");
      return;
    }

    const postal = sanitizeDigits(addressForm.postalCode).slice(0, 5);
    if (postal.length !== 5) {
      openToast("error", "Kode pos tidak valid", "Kode pos harus 5 digit.");
      return;
    }

    const normalizedAddress: AddressBookEntry = {
      ...addressForm,
      id: editingAddressId ?? addressForm.id ?? `addr-${Date.now()}`,
      phone: normalizedPhone,
      postalCode: postal,
      isDefault: Boolean(addressForm.isDefault)
    };

    const existingAddresses = form.addressBook ?? [];
    let nextAddresses = editingAddressId
      ? existingAddresses.map((entry) => (entry.id === editingAddressId ? normalizedAddress : entry))
      : [normalizedAddress, ...existingAddresses];

    if (normalizedAddress.isDefault) {
      nextAddresses = nextAddresses.map((entry) => ({
        ...entry,
        isDefault: entry.id === normalizedAddress.id
      }));
    }

    const nextProfile: UserProfile = {
      ...form,
      fullName: normalizedAddress.isDefault && normalizedAddress.recipientName ? normalizedAddress.recipientName : form.fullName,
      phone: normalizedAddress.isDefault && normalizedAddress.phone ? normalizedAddress.phone : form.phone,
      address: normalizedAddress.isDefault ? normalizedAddress.address : form.address,
      province: normalizedAddress.isDefault ? normalizedAddress.province : form.province,
      city: normalizedAddress.isDefault ? normalizedAddress.city : form.city,
      postalCode: normalizedAddress.isDefault ? normalizedAddress.postalCode : form.postalCode,
      addressBook: nextAddresses,
      defaultAddressId:
        normalizedAddress.isDefault || !form.defaultAddressId ? normalizedAddress.id : form.defaultAddressId
    };

    setForm(nextProfile);
    updateProfile(nextProfile);
    setAddressOpen(false);
    setEditingAddressId(null);
    openToast("success", "Alamat tersimpan", "Daftar alamat berhasil diperbarui.");
  };

  const handleDeleteAddress = (addressId: string) => {
    const nextAddresses = (form.addressBook ?? []).filter((address) => address.id !== addressId);
    const nextDefault = nextAddresses.find((address) => address.isDefault) ?? nextAddresses[0] ?? null;

    const nextProfile: UserProfile = {
      ...form,
      addressBook: nextAddresses.map((address, index) => ({
        ...address,
        isDefault: nextDefault ? address.id === nextDefault.id : index === 0
      })),
      defaultAddressId: nextDefault?.id ?? null
    };

    setForm(nextProfile);
    updateProfile(nextProfile);
    openToast("success", "Alamat dihapus", "Daftar alamat berhasil diperbarui.");
  };

  const handleSetDefaultAddress = (addressId: string) => {
    const selected = (form.addressBook ?? []).find((address) => address.id === addressId);
    if (!selected) return;

    const nextAddresses = (form.addressBook ?? []).map((address) => ({
      ...address,
      isDefault: address.id === addressId
    }));

    const nextProfile: UserProfile = {
      ...form,
      fullName: selected.recipientName || form.fullName,
      phone: selected.phone || form.phone,
      address: selected.address,
      province: selected.province,
      city: selected.city,
      postalCode: selected.postalCode,
      defaultAddressId: addressId,
      addressBook: nextAddresses
    };

    setForm(nextProfile);
    updateProfile(nextProfile);
    openToast("success", "Alamat utama dipilih", "Alamat tersebut akan dipakai saat checkout.");
  };

  const handlePasswordSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!passwordForm.currentPassword.trim()) {
      openToast("error", "Password lama wajib diisi", "Masukkan password lama terlebih dahulu.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      openToast("error", "Konfirmasi tidak cocok", "Password baru dan konfirmasi harus sama.");
      return;
    }

    if (!passwordRule.test(passwordForm.newPassword)) {
      openToast("error", "Password belum memenuhi syarat", "Gunakan minimal 8 karakter dan harus mengandung huruf serta angka.");
      return;
    }

    setPasswordForm(emptyPasswordForm);
    setPasswordOpen(false);
    openToast("success", "Password diperbarui", "Password baru tersimpan pada sesi ini.");
  };

  const toggleNotification = (key: keyof ProfileNotificationSettings) => {
    setForm((prev) => ({
      ...prev,
      notifications: {
        ...notificationDefaults,
        ...(prev.notifications ?? {}),
        [key]: !((prev.notifications ?? notificationDefaults)[key])
      }
    }));
  };

  return (
    <SiteShell>
      <RequireAuth>
        <AppToast
          open={toast.open}
          variant={toast.variant}
          title={toast.title}
          message={toast.message}
          onClose={closeToast}
          autoHideMs={2800}
        />

        <section className="profile-page">
          <aside className="profile-sidebar">
            <div className="profile-user-card">
              <div className="profile-avatar overflow-hidden bg-ice">
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt="Foto profil" className="h-full w-full object-cover" />
                ) : (
                  <span>{(user?.name || "S").slice(0, 1).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h2>{form.fullName || user?.name || "Sabai User"}</h2>
                <p className="text-sm text-text">{user?.email || "Email login"}</p>
                <button type="button" onClick={handlePhotoPick}>Pilih Foto</button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>

            <div className="profile-side-box">
              <h3>Ringkasan</h3>
              <ul>
                <li>
                  <span>Status Profile</span>
                  <strong>{profileComplete ? "Siap Checkout" : "Perlu Dilengkapi"}</strong>
                </li>
                <li>
                  <span>Alamat Tersimpan</span>
                  <strong>{form.addressBook?.length ?? 0}</strong>
                </li>
                <li>
                  <span>Tanggal Lahir</span>
                  <strong>{formatBirthDate(form.birthDate)}</strong>
                </li>
              </ul>
            </div>

            <div className="profile-side-box">
              <h3>Menu Profile</h3>
              <ul className="profile-menu-list">
                {[
                  { key: "biodata", label: "Biodata Diri" },
                  { key: "alamat", label: "Daftar Alamat" },
                  { key: "pembayaran", label: "Pembayaran" },
                  { key: "notifikasi", label: "Notifikasi" },
                  { key: "keamanan", label: "Keamanan" }
                ].map((item) => (
                  <li key={item.key} className={activeSection === item.key ? "active" : ""}>
                    <button type="button" onClick={() => setActiveSection(item.key as any)}>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="profile-main">
            <div className="profile-header">
              <div>
                <h1>{activeSection === "biodata" ? "Biodata Diri" : activeSection === "alamat" ? "Daftar Alamat" : activeSection === "pembayaran" ? "Pembayaran" : activeSection === "notifikasi" ? "Notifikasi" : "Keamanan"}</h1>
                <p className="text-sm text-text">
                  {activeSection === "biodata"
                    ? "Data ini dipakai untuk identitas penerima paket."
                    : activeSection === "alamat"
                    ? "Kelola alamat pengiriman agar checkout lebih cepat."
                    : activeSection === "pembayaran"
                    ? "Lihat ringkasan pembayaran dan status order."
                    : activeSection === "notifikasi"
                    ? "Atur email dan WhatsApp notification untuk status order."
                    : "Kelola password profile untuk keamanan akun Anda."}
                </p>
              </div>
              <span className={`profile-chip ${profileComplete ? "complete" : "incomplete"}`}>
                {profileComplete ? "Profile Complete" : "Incomplete Profile"}
              </span>
            </div>

            {activeSection === "biodata" && (
              <div className="surface-card p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-ink">Biodata Diri</h2>
                    <p className="text-sm text-text">Data ini dipakai untuk identitas penerima paket.</p>
                  </div>
                  <button type="button" className="profile-outline-btn" onClick={handlePhotoPick}>
                    Pilih Foto
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
                  <div className="profile-field-row full">
                    <label>Foto Profil</label>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="profile-photo-placeholder overflow-hidden bg-ice">
                        {form.avatarUrl ? (
                          <img src={form.avatarUrl} alt="Preview foto profil" className="h-full w-full object-cover" />
                        ) : (
                          <span>{(user?.name || "S").slice(0, 1).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="space-y-2 text-sm text-text">
                        <p>Format: JPG, JPEG, PNG.</p>
                        <p>Maksimal ukuran file 10 MB.</p>
                        {form.avatarName && <p>File aktif: {form.avatarName}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="profile-field-row">
                    <label>Nama Lengkap</label>
                    <input
                      className="input-field"
                      value={form.fullName}
                      onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                      placeholder="Nama penerima paket"
                      required
                    />
                  </div>

                  <div className="profile-field-row">
                    <label>Tanggal Lahir</label>
                    <input
                      className="input-field"
                      type="date"
                      value={form.birthDate ?? ""}
                      onChange={(event) => setForm((prev) => ({ ...prev, birthDate: event.target.value }))}
                    />
                  </div>

                  <div className="profile-field-row">
                    <label>Jenis Kelamin</label>
                    <select
                      className="input-field"
                      value={(form.gender as string) ?? ""}
                      onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value as Gender | "" }))}
                    >
                      {genderOptions.map((option) => (
                        <option key={option.label} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="profile-field-row">
                    <label>Email</label>
                    <input className="input-field" value={user?.email || ""} readOnly />
                  </div>

                  <div className="profile-field-row">
                    <label>Nomor HP</label>
                    <input
                      className="input-field"
                      inputMode="numeric"
                      maxLength={15}
                      value={form.phone}
                      onChange={(event) => setForm((prev) => ({ ...prev, phone: sanitizeDigits(event.target.value) }))}
                      placeholder="08123456789"
                      required
                    />
                  </div>

                  <div className="profile-field-row full">
                    <label>Alamat Lengkap</label>
                    <textarea
                      className="input-field min-h-[120px] rounded-3xl"
                      value={form.address}
                      onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                      placeholder="Jl. Sudirman No.10 RT01/RW02"
                      required
                    />
                  </div>

                  <div className="profile-field-row">
                    <label>Provinsi</label>
                    <select
                      className="input-field"
                      value={form.province}
                      onChange={(event) => {
                        const province = event.target.value;
                        const options = cityOptionsByProvince[province] ?? [];
                        setForm((prev) => ({
                          ...prev,
                          province,
                          city: options.includes(prev.city) ? prev.city : options[0] ?? ""
                        }));
                      }}
                      required
                    >
                      <option value="">Pilih provinsi</option>
                      {provinceOptions.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="profile-field-row">
                    <label>Kota/Kabupaten</label>
                    <select
                      className="input-field"
                      value={form.city}
                      onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                      required
                      disabled={!form.province}
                    >
                      <option value="">{form.province ? "Pilih kota/kabupaten" : "Pilih provinsi dulu"}</option>
                      {cityOptions.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="profile-field-row">
                    <label>Kode Pos</label>
                    <input
                      className="input-field"
                      inputMode="numeric"
                      maxLength={5}
                      value={form.postalCode}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, postalCode: sanitizeDigits(event.target.value).slice(0, 5) }))
                      }
                      placeholder="40111"
                      required
                    />
                  </div>

                  <div className="lg:col-span-2 flex flex-wrap items-center gap-3">
                    <button type="submit" className="btn-primary">
                      Simpan Profile
                    </button>
                    {primaryAddress && (
                      <p className="text-sm text-text">
                        Alamat utama saat ini: {primaryAddress.label} ({primaryAddress.city})
                      </p>
                    )}
                  </div>
                </form>
              </div>
            )}

            {activeSection === "alamat" && (
              <div className="surface-card p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-ink">Daftar Alamat</h2>
                    <p className="text-sm text-text">Tambahkan rumah, kos, atau kantor untuk checkout lebih cepat.</p>
                  </div>
                  <button type="button" className="btn-secondary" onClick={() => openAddressModal()}>
                    Tambah Alamat
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {(form.addressBook ?? []).length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-ink/15 bg-white p-5 text-sm text-text md:col-span-2">
                      Belum ada alamat tersimpan. Tambahkan alamat utama dulu agar checkout bisa menarik data pengiriman otomatis.
                    </div>
                  ) : (
                    (form.addressBook ?? []).map((address) => (
                      <div
                        key={address.id}
                        className={`rounded-3xl border p-5 ${address.isDefault ? "border-sky/30 bg-sky/5" : "border-ink/10 bg-white"}`}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-semibold text-ink">{address.label}</h3>
                              {address.isDefault && <span className="status-pill status-instock">Default</span>}
                            </div>
                            <p className="text-sm text-text">{address.recipientName || form.fullName}</p>
                          </div>
                          <button type="button" className="btn-ghost" onClick={() => openAddressModal(address)}>
                            Edit
                          </button>
                        </div>
                        <p className="text-sm text-text">{address.address}</p>
                        <p className="text-sm text-text">{address.city}, {address.province}</p>
                        <p className="text-sm text-text">Kode Pos {address.postalCode}</p>
                        <p className="text-sm text-text">HP {address.phone || form.phone}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {!address.isDefault && (
                            <button type="button" className="btn-secondary" onClick={() => handleSetDefaultAddress(address.id)}>
                              Jadikan Utama
                            </button>
                          )}
                          <button type="button" className="btn-ghost" onClick={() => handleDeleteAddress(address.id)}>
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSection === "pembayaran" && (
              <div className="surface-card p-6">
                <h2 className="text-xl font-semibold text-ink">Pembayaran</h2>
                <p className="mt-1 text-sm text-text">Riwayat Pembayaran</p>
                <div className="mt-4 rounded-3xl border border-ink/10 bg-white p-4 text-sm text-text">
                  Sistem pembayaran masih manual, jadi riwayat ini akan menampilkan order dan verifikasi yang sudah masuk.
                </div>
              </div>
            )}

            {activeSection === "notifikasi" && (
              <div className="surface-card p-6">
                <h2 className="text-xl font-semibold text-ink">Notifikasi</h2>
                <p className="mt-1 text-sm text-text">Atur email dan WhatsApp notification untuk status order.</p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-ink/10 bg-white p-4">
                    <h3 className="mb-3 text-sm font-semibold text-ink">Email Notification</h3>
                    {[
                      ["emailStatusOrder", "Status Order"],
                      ["emailPayment", "Pembayaran"],
                      ["emailShipping", "Pengiriman"]
                    ].map(([key, label]) => (
                      <label key={key} className="mb-2 flex items-center justify-between gap-3 text-sm text-text last:mb-0">
                        <span>{label}</span>
                        <input
                          type="checkbox"
                          checked={(form.notifications ?? notificationDefaults)[key as keyof ProfileNotificationSettings]}
                          onChange={() => toggleNotification(key as keyof ProfileNotificationSettings)}
                        />
                      </label>
                    ))}
                  </div>

                  <div className="rounded-3xl border border-ink/10 bg-white p-4">
                    <h3 className="mb-3 text-sm font-semibold text-ink">WhatsApp Notification</h3>
                    {[
                      ["whatsappGo", "Update GO"],
                      ["whatsappArrived", "Barang Tiba Indonesia"],
                      ["whatsappLink", "Link Shopee/TikTok"]
                    ].map(([key, label]) => (
                      <label key={key} className="mb-2 flex items-center justify-between gap-3 text-sm text-text last:mb-0">
                        <span>{label}</span>
                        <input
                          type="checkbox"
                          checked={(form.notifications ?? notificationDefaults)[key as keyof ProfileNotificationSettings]}
                          onChange={() => toggleNotification(key as keyof ProfileNotificationSettings)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "keamanan" && (
              <div className="surface-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-ink">Keamanan</h2>
                    <p className="text-sm text-text">PIN Sabai dan verifikasi instan dihapus. Fokus pada password profile.</p>
                  </div>
                  <button type="button" className="btn-primary" onClick={() => setPasswordOpen(true)}>
                    Ubah Password
                  </button>
                </div>
                <div className="mt-4 rounded-3xl border border-ink/10 bg-white p-4 text-sm text-text">
                  Password baru minimal 8 karakter dan harus mengandung huruf serta angka.
                </div>
              </div>
            )}
          </div>
        </section>

        {passwordOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
            <div className="surface-card w-full max-w-lg p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-ink">Ubah Password</h2>
                  <p className="text-sm text-text">Masukkan password lama dan password baru yang aman.</p>
                </div>
                <button type="button" className="btn-ghost" onClick={() => setPasswordOpen(false)}>
                  Tutup
                </button>
              </div>

              <form className="grid gap-4" onSubmit={handlePasswordSubmit}>
                <div className="profile-field-row full">
                  <label>Password Lama</label>
                  <input
                    className="input-field"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                    required
                  />
                </div>
                <div className="profile-field-row full">
                  <label>Password Baru</label>
                  <input
                    className="input-field"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                    required
                  />
                </div>
                <div className="profile-field-row full">
                  <label>Konfirmasi Password Baru</label>
                  <input
                    className="input-field"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                    required
                  />
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <button type="button" className="btn-secondary" onClick={() => setPasswordOpen(false)}>
                    Batal
                  </button>
                  <button type="submit" className="btn-primary">
                    Simpan Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {addressOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
            <div className="surface-card w-full max-w-2xl p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-ink">{editingAddressId ? "Edit Alamat" : "Tambah Alamat"}</h2>
                  <p className="text-sm text-text">Alamat ini akan tersimpan di daftar alamat profile.</p>
                </div>
                <button type="button" className="btn-ghost" onClick={closeAddressModal}>
                  Tutup
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="profile-field-row">
                  <label>Label Alamat</label>
                  <input
                    className="input-field"
                    value={addressForm.label}
                    onChange={(event) => setAddressForm((prev) => ({ ...prev, label: event.target.value }))}
                    placeholder="Rumah / Kos / Kantor"
                  />
                </div>
                <div className="profile-field-row">
                  <label>Nama Penerima</label>
                  <input
                    className="input-field"
                    value={addressForm.recipientName}
                    onChange={(event) => setAddressForm((prev) => ({ ...prev, recipientName: event.target.value }))}
                    placeholder="Nama lengkap"
                  />
                </div>
                <div className="profile-field-row">
                  <label>Nomor HP</label>
                  <input
                    className="input-field"
                    inputMode="numeric"
                    maxLength={15}
                    value={addressForm.phone}
                    onChange={(event) => setAddressForm((prev) => ({ ...prev, phone: sanitizeDigits(event.target.value) }))}
                    placeholder="08123456789"
                  />
                </div>
                <div className="profile-field-row full">
                  <label>Alamat Lengkap</label>
                  <textarea
                    className="input-field min-h-[110px] rounded-3xl"
                    value={addressForm.address}
                    onChange={(event) => setAddressForm((prev) => ({ ...prev, address: event.target.value }))}
                    placeholder="Jl. Sudirman No.10 RT01/RW02"
                  />
                </div>
                <div className="profile-field-row">
                  <label>Provinsi</label>
                  <select
                    className="input-field"
                    value={addressForm.province}
                    onChange={(event) => {
                      const province = event.target.value;
                      const options = cityOptionsByProvince[province] ?? [];
                      setAddressForm((prev) => ({
                        ...prev,
                        province,
                        city: options.includes(prev.city) ? prev.city : options[0] ?? ""
                      }));
                    }}
                  >
                    <option value="">Pilih provinsi</option>
                    {provinceOptions.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="profile-field-row">
                  <label>Kota/Kabupaten</label>
                  <select
                    className="input-field"
                    value={addressForm.city}
                    onChange={(event) => setAddressForm((prev) => ({ ...prev, city: event.target.value }))}
                    disabled={!addressForm.province}
                  >
                    <option value="">{addressForm.province ? "Pilih kota/kabupaten" : "Pilih provinsi dulu"}</option>
                    {(cityOptionsByProvince[addressForm.province] ?? []).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="profile-field-row">
                  <label>Kode Pos</label>
                  <input
                    className="input-field"
                    inputMode="numeric"
                    maxLength={5}
                    value={addressForm.postalCode}
                    onChange={(event) =>
                      setAddressForm((prev) => ({ ...prev, postalCode: sanitizeDigits(event.target.value).slice(0, 5) }))
                    }
                    placeholder="40111"
                  />
                </div>
                <label className="md:col-span-2 flex items-center gap-3 text-sm text-text">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(event) => setAddressForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
                  />
                  Jadikan alamat utama untuk checkout
                </label>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={closeAddressModal}>
                  Batal
                </button>
                <button type="button" className="btn-primary" onClick={handleSaveAddress}>
                  Simpan Alamat
                </button>
              </div>
            </div>
          </div>
        )}
      </RequireAuth>
    </SiteShell>
  );
}