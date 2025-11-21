import { Request, Response } from "express";
import Peminjaman from "../models/peminjaman.model";

export default {
    async buatPeminjaman (req: Request, res: Response) {
        try {
            const { id_user, batas_pinjam, detail_peminjaman } = req.body as unknown as {
                id_user: string;
                batas_pinjam: Date;
                detail_peminjaman: Array<{
                    id_buku: string;
                    jumlah: number;
                }>;
            };
            
            const peminjamanAktif = await Peminjaman.findOne({id_user, status: "dipinjam"});
            if (peminjamanAktif) {
                return res.status(400).json({ message: "Kamu masih memiliki peminjaman aktif" });
            }

            if (detail_peminjaman.length > 3) {
                return res.status(400).json({ message: "Maksimal peminjaman adalah 3 buku" });
            }

            const barcode = `PMJ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const batas_ambil = new Date();
            // batas ambil 1 hari dari sekarang
            batas_ambil.setDate(batas_ambil.getDate() + 1);

            const now = new Date();
            if (new Date(batas_pinjam) <= now) {
                return res.status(400).json({ message: "Batas pinjam harus lebih dari tanggal sekarang" });
            }
            
            const maxBatasPinjam = new Date();
            maxBatasPinjam.setDate(now.getDate() + 21);
            if (new Date(batas_pinjam) > maxBatasPinjam) {
                return res.status(400).json({ message: "Batas pinjam maksimal 21 hari dari sekarang" });
            }

            const result = await Peminjaman.create({
                barcode,
                id_user,
                batas_pinjam,
                batas_ambil,
                detail_peminjaman
            });
            res.status(200).json({
                message: "Peminjaman berhasil dibuat",
                data: result,
            });
            
        } catch (error) {
            res.status(500).json({ message: "Internal server error", error });
        }
    },

    async ubahStatus (req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body as unknown as { status: 'dipinjam' | 'dikembalikan' | 'terlambat' };
            const peminjaman = await Peminjaman.findById(id);

            if(!peminjaman) {
                return res.status(404).json({ message: "Peminjaman tidak ditemukan" });
            }

            peminjaman.status = status;
            const result = await peminjaman.save();

            res.status(200).json({
                message: "Status peminjaman berhasil diubah",
                data: result,
            });
        } catch (error) {
            res.status(500).json({ message: "Internal server error", error });
        }
    },

    async hitungDenda (req: Request, res: Response) {
        try {
            const { id } = req.params;
            const peminjaman = await Peminjaman.findById(id);

            if (!peminjaman) {
                return res.status(404).json({ message: "Peminjaman tidak ditemukan" });
            }

            if (peminjaman.status !== 'terlambat') {
                return res.status(400).json({ message: "Peminjaman tidak dalam status terlambat" });
            }

            const now = new Date();
            const batasPinjam = new Date(peminjaman.batas_pinjam);
            const diffTime = Math.abs(now.getTime() - batasPinjam.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const dendaPerhari = 3000; // denda per hari
            const totalDenda = diffDays * dendaPerhari;
            res.status(200).json({
                message: "Perhitungan denda berhasil",
                data: { totalDenda },
            });

        } catch (error) {
            res.status(500).json({ message: "Internal server error", error });
        }
    },

    async daftarSemuaPeminjaman (req: Request, res: Response) {
        try {
            const peminjamanList = await Peminjaman.find();
            res.status(200).json({
                message: "Daftar semua peminjaman berhasil diambil",
                data: peminjamanList,
            });
            
        } catch (error) {
            res.status(500).json({ message: "Internal server error", error });
        }
    },

    async daftarPeminjamanUser (req: Request, res: Response) {
        try {
            const { id_user } = req.params;
            const peminjamanList = await Peminjaman.find({id_user});
            res.status(200).json({
                message: "Daftar peminjaman user berhasil diambil",
                data: peminjamanList,
            });
            
        } catch (error) {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
}