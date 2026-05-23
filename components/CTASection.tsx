export default function CTASection() {
  const phone = "6287752750421";
  const message = "Halo kak! saya mau req barang apakah bisa?";
  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <section className="rounded-3xl border border-white/70 bg-gradient-to-br from-white via-[#f7f9fb] to-[#eef3f6] p-8 text-ink shadow-lift">
      <div className="grid gap-6 md:grid-cols-[1.3fr_0.9fr] md:items-center">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-ink">Request Your Dream Merch ✨</h2>
          <p className="text-sm leading-6 text-text">
            Ga nemu barang yang kamu cari? Chat aja, kita bantuin 💙
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-3 rounded-xl border border-ink/10 bg-white/80 p-4">
          <div>
            <h3 className="text-lg font-semibold text-ink">Sabai Merch Support</h3>
            <p className="text-sm text-text">Chat langsung dengan admin untuk request atau tanya produk</p>
          </div>

          <a href={waLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block w-full">
            <button className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white shadow-sm">
              Contact Here 💬
            </button>
          </a>
        </div>
      </div>
    </section>
  );
}
