Penjelasan untuk `LegacyShopPage.tsx`

Tujuan
- `LegacyShopPage.tsx` adalah komponen halaman toko lama (legacy) yang masih dipertahankan dalam kode untuk tujuan kompatibilitas atau referensi. Komponen ini menampung struktur UI dan alur bisnis awal untuk tampilan shop/marketplace sebelum refactor.

Di mana digunakan
- Biasanya dirujuk oleh rute shop atau halaman yang menampilkan daftar produk. Jika proyek telah memigrasi ke komponen/halaman baru, file ini dipertahankan agar developer bisa melihat perilaku lama atau mengambil bagian kode yang masih relevan.

Perilaku utama
- Menampilkan daftar produk, tombol aksi (`Add to Cart`, `Buy Now`), filter status (Pre-order / In Stock / Closed), dan kontrol navigasi sederhana.
- Mengatur interaksi user dasar seperti pemilihan kuantitas dan navigasi ke halaman produk/checkout.

Asumsi dan efek samping
- Bisa membaca/menulis ke konteks atau `localStorage` untuk menyimpan keranjang sementara.
- Berpotensi menggunakan utilitas global di `lib/` (format, store, types). Jika terjadi inkonsistensi state, periksa normalisasi status di `lib/store.tsx`.

Catatan pemeliharaan
- Jika aplikasi sudah memiliki halaman `Shop`/`Product` terpisah yang lebih modern, pertimbangkan untuk:
  - Memindahkan logika yang masih dipakai ke komponen baru.
  - Menghapus `LegacyShopPage.tsx` setelah verifikasi bahwa tidak ada rute atau import yang tersisa.
- Jangan hapus sebelum menjalankan smoke tests dan memeriksa rute `shop`, `product/*`, dan alur checkout.

Referensi terkait
- `components/LegacyShopPage.tsx` — implementasi komponen legacy saat ini.
- `lib/store.tsx`, `lib/format.ts` — utilitas yang umum dipakai oleh halaman toko.

Panduan cepat untuk developer
- Untuk memodernisasi: ekstrak UI presentasional ke komponen kecil di `components/`, pindahkan state ke `lib/store.tsx` atau ke hook terpisah, lalu rute ulang `app/shop` ke implementasi baru.

Catatan terakhir
- File ini bersifat dokumentatif — jangan simpan logika bisnis baru di file legacy; gunakan sebagai referensi selama migrasi.
