import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function SupabaseTestPage() {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .limit(1);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold mb-4">Supabase Test</h1>
        <p className="mb-6 text-slate-600">Halaman ini menguji koneksi ke Supabase dan menampilkan hasil query pertama.</p>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900">
            <h2 className="font-semibold mb-2">Error koneksi</h2>
            <p>{error.message}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-800">
            <h2 className="font-semibold mb-2">Koneksi berhasil</h2>
            <pre className="overflow-x-auto text-sm">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </main>
  );
}
