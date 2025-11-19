import { Request, Response } from "express";
import Buku, { IBuku } from "../models/buku.model";
import { FilterQuery } from "mongoose";

export default {
    async buatBuku (req: Request, res: Response) {
        try {
            const { judul_buku, genre_buku, tahun_terbit, penulis, penerbit, stok } = req.body;
            
            const result = await Buku.create({
                judul_buku,
                genre_buku,
                tahun_terbit,
                penulis,
                penerbit,
                stok
            });
            res.status(200).json({ message: "Buku berhasil dibuat", data: result });
            
        } catch (error) {
            res.status(500).json({ message: "Gagal membuat buku", error });
        }
    },

    async listBuku (req: Request, res: Response) {
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

            const result = await Buku.find(query).sort({createdAt: -1}).exec();
            res.status(200).json({ message: "Berhasil mengambil daftar buku", data: result });

        } catch (error) {
            res.status(500).json({ message: "Gagal mengambil daftar buku", error });
        }
    },

    async lihatBuku (req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await Buku.findById(id);
            res.status(200).json({ message: "Berhasil mengambil detail buku", data: result });
        } catch (error) {
            res.status(500).json({ message: "Gagal mengambil detail buku", error });
        }
    },

    async ubahBuku (req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { judul_buku, genre_buku, tahun_terbit, penulis, penerbit } = req.body;
            const result = await Buku.findByIdAndUpdate(id, {
                judul_buku,
                genre_buku,
                tahun_terbit,
                penulis,
                penerbit
            }, { new: true });
            res.status(200).json({ message: "Buku berhasil diubah", data: result });
        } catch (error) {
            res.status(500).json({ message: "Gagal mengubah buku", error });
        }
    },

    async hapusBuku (req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await Buku.findByIdAndDelete(id);
            res.status(200).json({ message: "Buku berhasil dihapus", data: result });
            
        } catch (error) {
            res.status(500).json({ message: "Gagal menghapus buku", error });
        }
    },

    async tambahStok (req: Request, res: Response) {
        try {
            const { id } = req.params;
            const {jumlah} = req.body;
            const buku = await Buku.findById(id);
            if (!buku) {
                return res.status(404).json({ message: "Buku tidak ditemukan" });
            }
            buku.stok += jumlah;
            const result = await buku.save();
            res.status(200).json({ message: "Stok buku berhasil ditambah", data: result });
        } catch (error) {
            res.status(500).json({ message: "Gagal menambah stok buku", error });
        }
    },

    async kurangiStok (req: Request, res: Response) {
        try {
            const { id } = req.params;
            const {jumlah} = req.body;
            const buku = await Buku.findById(id);
            if (!buku) {
                return res.status(404).json({ message: "Buku tidak ditemukan" });
            }
            if (buku.stok < jumlah) {
                return res.status(400).json({ message: "Stok buku tidak mencukupi" });
            }
            buku.stok -= jumlah;
            const result = await buku.save();
            res.status(200).json({ message: "Stok buku berhasil dikurangi", data: result });
        } catch (error) {
            res.status(500).json({ message: "Gagal mengurangi stok buku", error });
        }
    }
}