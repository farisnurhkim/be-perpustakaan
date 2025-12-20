import { Request, Response } from "express";
import Buku, { IBuku } from "../models/buku.model";
import { FilterQuery } from "mongoose";
import Controller from "./controller";
import Peminjaman from "../models/peminjaman.model";

class BukuController extends Controller {
    buatBuku = async (req: Request, res: Response) => {
        try {
            const { judul_buku, genre_buku, tahun_terbit, penulis, penerbit, stok, foto } = req.body;

            const result = await Buku.create({
                judul_buku,
                genre_buku,
                tahun_terbit,
                penulis,
                penerbit,
                stok,
                foto
            });

            this.success(res, "Buku berhasil dibuat", result);

        } catch (error) {
            this.error(res, "Internal Server Error", 500);
        }
    }

    listBuku = async (req: Request, res: Response) => {
        try {
            const { category = "", search = "" } = req.query as unknown as { category: string, search: string };
            const query: FilterQuery<IBuku> = {};

            if (category) {
                query.genre_buku = category;
            }
            if (search) {
                query.$or = [
                    { judul_buku: { $regex: search, $options: "i" } },
                    { penulis: { $regex: search, $options: "i" } },
                    { penerbit: { $regex: search, $options: "i" } },
                ];
            }

            const result = await Buku.find(query).sort({ createdAt: -1 }).exec();
            this.success(res, "Berhasil mengambil daftar buku", result);

        } catch (error) {
            this.error(res, "Gagal mengambil daftar buku", 500);
        }
    }

    lihatBuku = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await Buku.findById(id);
            this.success(res, "Berhasil mengambil detail buku", result);

        } catch (error) {
            this.error(res, "Internal Server Error", 500);
        }
    }

    ubahBuku = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { judul_buku, genre_buku, tahun_terbit, penulis, penerbit, foto } = req.body;
            const result = await Buku.findByIdAndUpdate(id, {
                judul_buku,
                genre_buku,
                tahun_terbit,
                penulis,
                penerbit,
                foto
            }, { new: true });
            this.success(res, "Buku berhasil diubah", result);
        } catch (error) {
            this.error(res, "Internal Server Error", 500);
        }
    }

    hapusBuku = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await Buku.findByIdAndDelete(id);
            this.success(res, "Buku berhasil dihapus", result);

        } catch (error) {
            this.error(res, "Internal Server Error", 500);
        }
    }

    tambahStok = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { jumlah } = req.body;
            const buku = await Buku.findById(id);
            if (!buku) {
                return this.error(res, "Buku tidak ditemukan", 404);
            }
            buku.stok += jumlah;
            const result = await buku.save();

            this.success(res, "Stok buku berhasil ditambah", result);
        } catch (error) {
            this.error(res, "Internal Server Error", 500);
        }
    }

    kurangiStok = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { jumlah } = req.body;
            const buku = await Buku.findById(id);
            if (!buku) {
                return this.error(res, "Buku tidak ditemukan", 404);
            }
            if (buku.stok < jumlah) {
                return this.error(res, "Stok buku tidak mencukupi", 400);
            }
            buku.stok -= jumlah;
            const result = await buku.save();
            this.success(res, "Stok buku berhasil dikurangi", result);
        } catch (error) {
            this.error(res, "Internal Server Error", 500);
        }
    }

    bukuPopuler = async (req: Request, res: Response) => {
        try {
            const result = await Peminjaman.aggregate([
                {
                    $match: {
                        status: {
                            $in: ["dipinjam", "terlambat", "pending_pengembalian", "dikembalikan"]
                        }
                    }
                },

                { $unwind: "$detail_peminjaman" },

                {
                    $group: {
                        _id: "$detail_peminjaman.id_buku",
                        total_dipinjam: { $sum: "$detail_peminjaman.jumlah" }
                    }
                },

                {
                    $lookup: {
                        from: "bukus",
                        localField: "_id",
                        foreignField: "_id",
                        as: "buku"
                    }
                },

                { $unwind: "$buku" },

                {
                    $project: {
                        _id: "$buku._id",
                        foto: "$buku.foto",
                        judul_buku: "$buku.judul_buku",
                        penulis: "$buku.penulis",
                        genre_buku: "$buku.genre_buku",
                        stok: "$buku.stok",
                        total_dipinjam: 1
                    }
                },

                { $sort: { total_dipinjam: -1 } }
            ]);

            this.success(res, "Berhasil mengambil daftar buku populer", result);
        } catch (error) {
            this.error(res, "Internal Server Error", 500);
        }
    }
}

export default new BukuController();