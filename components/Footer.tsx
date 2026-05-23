export default function Footer() {
  return (
    <footer id="contact" className="mt-16 border-t border-white/70 bg-white/70">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-ink">About</h3>
          <p className="text-sm text-text">
            Sabai Merch helps Thailand group orders feel effortless, curated, and reliable.
          </p>
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-ink">Contact</h3>
          <p className="text-sm text-text">support@sabaimerch.com</p>
          <p className="text-sm text-text">+62 877-5275-0421</p>
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-ink">Social Media</h3>
          <div className="flex gap-3">
            {["IG", "FB", "X"].map((label) => (
              <span
                key={label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/70 py-4 text-center text-xs text-text">
        © 2026 Sabai Merch. All rights reserved.
      </div>
    </footer>
  );
}
