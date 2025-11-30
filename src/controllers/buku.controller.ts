import { Request, Response } from "express";
import Buku, { IBuku } from "../models/buku.model";
import { FilterQuery } from "mongoose";
import Controller from "./controller";

class BukuController extends Controller {
    buatBuku = async (req: Request, res: Response) => {
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

            const result = await Buku.find(query).sort({createdAt: -1}).exec();
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
            const { judul_buku, genre_buku, tahun_terbit, penulis, penerbit } = req.body;
            const result = await Buku.findByIdAndUpdate(id, {
                judul_buku,
                genre_buku,
                tahun_terbit,
                penulis,
                penerbit
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
            const {jumlah} = req.body;
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
            const {jumlah} = req.body;
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
}

export default new BukuController();