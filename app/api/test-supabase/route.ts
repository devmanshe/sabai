import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase' // Sesuaikan path jika berlokasi di service/

export async function GET() {
  try {
    const supabase = await createClient()

    // Kita coba fetch dari tabel profiles yang tadi dibuat
    // Ingat: Karena RLS ketat dan kita tidak login, ini harusnya mengembalikan array kosong []
    // Tapi jika berhasil mengembalikan [], artinya KONEKSI BERHASIL tanpa error server.
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({ status: 'Error', message: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      status: 'Success', 
      message: 'Supabase connected successfully!',
      data: data 
    })
  } catch (err: any) {
    return NextResponse.json({ status: 'Exception', message: err.message }, { status: 500 })
  }
}