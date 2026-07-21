import midtransClient from "midtrans-client";

// Snap dipakai untuk generate token pembayaran (dipanggil dari server,
// misal saat customer klik "Bayar" di halaman order).
export const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY as string,
  clientKey: process.env.MIDTRANS_CLIENT_KEY as string,
});

// CoreApi dipakai kalau nanti perlu cek status transaksi manual
// atau proses notifikasi webhook dari Midtrans.
export const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY as string,
  clientKey: process.env.MIDTRANS_CLIENT_KEY as string,
});
