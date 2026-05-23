"use client";

export default function AdminSupportPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Support</h1>
        <p className="text-sm text-text">Bantu customer konfirmasi order dan pembayaran.</p>
      </div>

      <div className="soft-panel p-5">
        <h2 className="text-lg font-semibold">Quick Channel</h2>
        <p className="mt-2 text-sm text-text">
          Untuk versi saat ini, support diarahkan ke WhatsApp agar respons cepat.
        </p>
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noreferrer"
          className="btn-primary mt-4 inline-block"
        >
          Open WhatsApp Support
        </a>
      </div>

      <div className="soft-panel p-5">
        <h2 className="text-lg font-semibold">Sample Inbox</h2>
        <div className="mt-3 space-y-3 text-sm">
          <div className="rounded-xl border border-ink/10 bg-white p-3">
            <p className="font-semibold text-ink">Nida S.</p>
            <p className="text-text">Min, order #VM-AB12CD34 sudah dibayar tapi belum berubah status.</p>
          </div>
          <div className="rounded-xl border border-ink/10 bg-white p-3">
            <p className="font-semibold text-ink">Aria K.</p>
            <p className="text-text">Kapan estimasi kirim untuk preorder batch April?</p>
          </div>
        </div>
      </div>
    </section>
  );
}
