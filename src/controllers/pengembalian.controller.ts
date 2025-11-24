import { Request, Response } from "express";
import Peminjaman from "../models/peminjaman.model";
import Pengembalian from "../models/pengembalian_model";

export default {
     async hitungDenda (id: string) {
        try {
            const peminjaman = await Peminjaman.findById(id);

            if (!peminjaman) {
                return { error: true, message: "Peminjaman tidak ditemukan", totalDenda: 0 };
            }

            if (peminjaman.status !== 'terlambat') {
                return { error: true, message: "Peminjaman tidak dalam status terlambat", totalDenda: 0};
            }

            const now = new Date();
            const batasPinjam = new Date(peminjaman.batas_pinjam);
            const diffTime = Math.abs(now.getTime() - batasPinjam.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const dendaPerhari = 3000; // denda per hari
            const totalDenda = diffDays * dendaPerhari;
            return { error: false, totalDenda, message: "Perhitungan denda berhasil" };

        } catch (error) {
            return { error: true, message: "Internal server error", totalDenda: 0}        
        
        }
    },

    async prosesPengembalian (req: Request, res: Response) {
        try {
            const { barcode } = req.params;
            const { keterangan, tgl_kembali } = req.body as unknown as {
                tgl_kembali: string;
                keterangan: string;
            };

            const peminjaman = await Peminjaman.findOne({ barcode });
            if (!peminjaman) {
                return res.status(404).json({ message: "Peminjaman tidak ditemukan" });
            }

            if (peminjaman.status === 'dikembalikan') {
                return res.status(400).json({ message: "Peminjaman sudah dikembalikan" });
            }

            const hitungDendaResult = await this.hitungDenda(peminjaman.id);
            if (hitungDendaResult.error) {
                return res.status(400).json({ message: hitungDendaResult.message });
            }

            peminjaman.status = 'dikembalikan';
            const resultPengembalian = await Pengembalian.create({
                id_peminjaman: peminjaman._id,
                tgl_kembali: tgl_kembali ? new Date(tgl_kembali) : new Date(),
                denda: hitungDendaResult.totalDenda,
                keterangan: keterangan || "",
            });
            await peminjaman.save();
            res.status(200).json({
                message: "Pengembalian berhasil diproses",
                data: resultPengembalian,
            });

            
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error", error });
        }
    }
}