import cron from 'node-cron';
import Peminjaman from '../models/peminjaman.model';

cron.schedule('0 0 * * *', async () => {
    console.log("Cron: cek peminjaman expired");

    try {
        const today = new Date();
        const result = await Peminjaman.updateMany(
            {
                status: "pending_peminjaman",
                batas_ambil: { $lt: today }
            },
            {
                $set: { status: "dibatalkan" }
            }
        );

        console.log(`Update selesai. ${result.modifiedCount} data peminjaman diubah menjadi terlambat.`);

    } catch (error) {
        console.error('Gagal menjalankan cron job:', error);
    }
}, {
    timezone: "Asia/Jakarta"
});