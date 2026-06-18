import { NextResponse } from 'next/server'
import { snap } from '@/lib/midtrans' // Sesuaikan path

export async function GET() {
  try {
    // Parameter dummy untuk test transaksi
    const parameter = {
      transaction_details: {
        order_id: `TEST-${Math.floor(Math.random() * 100000)}`, // Order ID harus unik tiap request
        gross_amount: 150000 
      },
      customer_details: {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        phone: "08123456789"
      }
    }

    // Meminta token transaksi ke server Midtrans
    const transaction = await snap.createTransaction(parameter)

    return NextResponse.json({ 
      status: 'Success', 
      message: 'Midtrans connected successfully!',
      token: transaction.token,
      redirect_url: transaction.redirect_url
    })
  } catch (err: any) {
    return NextResponse.json({ status: 'Error', message: err.message }, { status: 500 })
  }
}