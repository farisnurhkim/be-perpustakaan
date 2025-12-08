import { Request, Response } from "express";
import Peminjaman from "../models/peminjaman.model";
import mongoose from "mongoose";
import Controller from "./controller";

export class PeminjamanController extends Controller {
    buatPeminjaman = async (req: Request, res: Response) => {
        try {
            const { id_user, batas_pinjam, detail_peminjaman, tanggal_pinjam } = req.body as unknown as {
                id_user: string;
                tanggal_pinjam: string;
                batas_pinjam: string;
                detail_peminjaman: Array<{
                    id_buku: string;
                    jumlah: number;
                }>;
            };

            const peminjamanAktif = await Peminjaman.findOne({
                id_user: new mongoose.Types.ObjectId(id_user),
                status: { $in: ["dipinjam", "pending_peminjaman"] }
            });
            if (peminjamanAktif) {
                return this.error(res, "Kamu masih memiliki peminjaman aktif", 400);
            }

            if (detail_peminjaman.length > 3) {
                return this.error(res, "Maksimal peminjaman adalah 3 buku", 400);
            }

            const barcode = `PMJ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const tgl_pinjam = tanggal_pinjam ? new Date(tanggal_pinjam) : new Date();
            if (isNaN(tgl_pinjam.getTime())) {
                return this.error(res, "Tanggal pinjam tidak valid", 400);
            }

            // batas ambil 1 hari dari tanggal pinjam
            const batas_ambil = new Date(tgl_pinjam);
            batas_ambil.setDate(batas_ambil.getDate() + 1);

            const batasPinjamDate = new Date(batas_pinjam);
            if (isNaN(batasPinjamDate.getTime())) {
                return this.error(res, "Batas pinjam tidak valid", 400);
            }

            const now = new Date();
            tgl_pinjam.setHours(0,0,0,0);
            now.setHours(0,0,0,0);
            if (tgl_pinjam < now) {
                return this.error(res, "Tanggal pinjam harus mulai/lebih dari hari sekarang", 400);
            }

            if (batasPinjamDate <= tgl_pinjam) {
                return this.error(res, "Batas pinjam harus lebih dari tanggal pinjam", 400);
            }

            const maxBatasPinjam = new Date(tgl_pinjam);
            maxBatasPinjam.setDate(maxBatasPinjam.getDate() + 21); // maksimal 21 hari dari tanggal pinjam

            if (batasPinjamDate > maxBatasPinjam) {
                return this.error(res, "Maksimal batas pinjam adalah 21 hari dari tanggal pinjam", 400);
            }

            const result = await Peminjaman.create({
                barcode,
                id_user,
                batas_pinjam: batasPinjamDate,
                tgl_pinjam,
                batas_ambil,
                detail_peminjaman
            });
            this.success(res, "Peminjaman berhasil dibuat", result);

        } catch (error) {
            this.error(res, "Internal server error", 500);
        }
    }

    konfirmasiPeminjaman = async (req: Request, res: Response) => {
        try {
            const { barcode } = req.params;
            const result = await Peminjaman.findOneAndUpdate({ barcode, status: "pending_peminjaman" }, { status: "dipinjam" }, { new: true });
            if (!result) {
                return this.error(res, "Peminjaman tidak ditemukan atau sudah dikonfirmasi", 404);
            }
            this.success(res, "Peminjaman berhasil di Konfirmasi", result);
            
        } catch (error) {
            this.error(res, "Internal Server Error", 500);
        }
    }

    hitungDenda = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const peminjaman = await Peminjaman.findById(id);

            if (!peminjaman) {
                return this.error(res, "Peminjaman tidak ditemukan", 404);
            }

            if (peminjaman.status === "dikembalikan" || peminjaman.status === "pending_pengembalian") {
                return this.error(res, "Peminjaman tidak dalam status terlambat", 400);
            }

            const now = new Date();
            const batasPinjam = new Date(peminjaman.batas_pinjam);

            if (now <= batasPinjam) {
                return this.success(res, "Tidak ada denda", { totalDenda: 0 });
            }

            const diffTime = now.getTime() - batasPinjam.getTime();
            const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
            const dendaPerhari = 3000; // denda per hari
            const totalDenda = diffDays * dendaPerhari;
            this.success(res, "Perhitungan denda berhasil", { totalDenda });

        } catch (error) {
            this.error(res, "Internal Server Error", 500);
        }
    }

    daftarSemuaPeminjaman = async(req: Request, res: Response) => {
        try {
            const peminjamanList = await Peminjaman.find().populate('id_user').populate('pengembalian').populate({
                path: "detail_peminjaman.id_buku",
                model: "Buku"
            }).exec();
            this.success(res, "Daftar semua peminjaman berhasil diambil", peminjamanList);

        } catch (error) {
            this.error(res, "Internal server error", 500);
        }
    }

    daftarPeminjamanUser = async(req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const peminjamanList = await Peminjaman.find({
                id_user: new mongoose.Types.ObjectId(id)
            });

            this.success(res, "Daftar peminjaman user berhasil diambil", peminjamanList);

        } catch (error) {
            this.error(res, "Internal server error", 500);
        }
    }

     cariPeminjaman = async (req: Request, res: Response) => {
        try {
            const { barcode } = req.params;
            const peminjaman = await Peminjaman.findOne({ barcode });

            if (!peminjaman) {
                return this.error(res, "Peminjaman tidak ditemukan", 404);
            }

            this.success(res, "Berhasil mengambil data peminjaman", peminjaman);

        } catch (error) {
            this.error(res, "Internal Server Error", 500);
        }
    }
}

export default new PeminjamanController();