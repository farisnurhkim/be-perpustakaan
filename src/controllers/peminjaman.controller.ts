import { Request, Response } from "express";
import Peminjaman from "../models/peminjaman.model";
import mongoose from "mongoose";
import Controller from "./controller";
import Buku from "../models/buku.model";

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

            const tgl_pinjam = new Date(tanggal_pinjam);
            const batasPinjamDate = new Date(batas_pinjam);
            const now = new Date();

            if (isNaN(tgl_pinjam.getTime())) {
                return this.error(res, "Tanggal pinjam tidak valid", 400);
            }

            // batas ambil 1 hari dari tanggal pinjam
            const batas_ambil = new Date(tgl_pinjam);
            batas_ambil.setDate(batas_ambil.getDate() + 1);

            if (isNaN(batasPinjamDate.getTime())) {
                return this.error(res, "Batas pinjam tidak valid", 400);
            }

            tgl_pinjam.setHours(0, 0, 0, 0);
            now.setHours(0, 0, 0, 0);
            batasPinjamDate.setHours(0, 0, 0, 0);
            if (tgl_pinjam < now) {
                return this.error(
                    res,
                    "Tanggal pinjam harus mulai dari waktu sekarang",
                    400
                );
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
                batas_pinjam: new Date(batas_pinjam),
                tgl_pinjam: new Date(tanggal_pinjam),
                batas_ambil,
                detail_peminjaman
            });
            this.success(res, "Peminjaman berhasil dibuat", result);

        } catch (error) {
            this.error(res, "Internal server error", 500);
        }
    }

    konfirmasiPeminjaman = async (req: Request, res: Response) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { barcode } = req.params;

            // Ambil peminjaman
            const peminjaman = await Peminjaman.findOne(
                { barcode, status: "pending_peminjaman" },
                null,
                { session }
            );

            if (!peminjaman) {
                await session.abortTransaction();
                return this.error(res, "Peminjaman tidak ditemukan atau sudah dikonfirmasi", 404);
            }

            // Kurangi stok berdasarkan detail_peminjaman
            for (const item of peminjaman.detail_peminjaman) {
                const updated = await Buku.findOneAndUpdate(
                    {
                        _id: item.id_buku,
                        stok: { $gte: item.jumlah }
                    },
                    {
                        $inc: { stok: -item.jumlah }
                    },
                    { session, new: true }
                );

                if (!updated) {
                    await session.abortTransaction();
                    return this.error(
                        res,
                        "Stok buku tidak mencukupi",
                        400
                    );
                }
            }

            // Update status peminjaman
            peminjaman.status = "dipinjam";
            await peminjaman.save({ session });

            await session.commitTransaction();
            session.endSession();

            const result = await Peminjaman.findById(peminjaman._id)
            .populate("id_user")
            .populate("pengembalian")
            .populate({
                path: "detail_peminjaman.id_buku",
                model: "Buku"
            });

            return this.success(res, "Peminjaman berhasil dikonfirmasi", result);

        } catch (error) {
            this.error(res, "Internal Server Error", 500);
        }
    }

    hitungDenda = async (req: Request, res: Response) => {
        try {
            const { barcode } = req.params;
            const peminjaman = await Peminjaman.findOne({barcode});

            if (!peminjaman) {
                return this.error(res, "Peminjaman tidak ditemukan", 404);
            }

            if (peminjaman.status === "dikembalikan") {
                return this.error(res, "Peminjaman tidak dalam status terlambat", 400);
            }

            const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const now = new Date();
            const batasPinjam = new Date(peminjaman.batas_pinjam);
            const nowDay = startOfDay(now);
            const batasDay = startOfDay(batasPinjam);
            if (nowDay <= batasDay) {
                return this.success(res, "Tidak ada denda", { totalDenda: 0 });
            }
            const diffTime = nowDay.getTime() - batasDay.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            const dendaPerhari = 2000;
            const totalDenda = diffDays * dendaPerhari;
            this.success(res, "Perhitungan denda berhasil", { totalDenda });

        } catch (error) {
            this.error(res, "Internal Server Error", 500);
        }
    }

    daftarSemuaPeminjaman = async (req: Request, res: Response) => {
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

    daftarPeminjamanUser = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const peminjamanList = await Peminjaman.find({
                id_user: new mongoose.Types.ObjectId(id)
            }).populate('id_user').populate('pengembalian').populate({
                path: "detail_peminjaman.id_buku",
                model: "Buku"
            }).exec();

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