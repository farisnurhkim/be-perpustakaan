import { Request, Response } from "express";
import Peminjaman from "../models/peminjaman.model";
import Pengembalian from "../models/pengembalian_model";
import Controller from "./controller";

class PengembalianController extends Controller {

    konfirmasiPengembalian = async (req: Request, res: Response) => {
        try {
            const { barcode } = req.params;
            const { keterangan, tgl_kembali, denda } = req.body as unknown as {
                tgl_kembali: string;
                keterangan: string;
                denda: number;
            };

            const peminjaman = await Peminjaman.findOne({ barcode });
            if (!peminjaman) {
                return res.status(404).json({ message: "Peminjaman tidak ditemukan" });
            }

            if (peminjaman.status === 'dikembalikan' || peminjaman.status === 'terlambat') {
                return res.status(400).json({ message: "Peminjaman sudah dikembalikan" });
            }

            if (peminjaman.status !== "pending_pengembalian") {
                return this.error(res, "Pengembalian belum diajukan", 400);
            }

            if (typeof denda !== "number" || denda < 0) {
                return res.status(400).json({ message: "Denda tidak valid" });
            }

            let terlambat = false;
            if (denda > 0) {
                terlambat = true;
            }

            peminjaman.status = terlambat ? 'terlambat' : 'dikembalikan';
            const resultPengembalian = await Pengembalian.create({
                id_peminjaman: peminjaman._id,
                tgl_kembali: tgl_kembali ? new Date(tgl_kembali) : new Date(),
                denda,
                keterangan: keterangan || "",
            });
            await peminjaman.save();
            res.status(200).json({
                message: "Pengembalian berhasil dikonfirmasi",
                data: resultPengembalian,
            });


        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error", error });
        }
    }

    prosesPengembalian = async (req: Request, res: Response) => {
        try {
            const { barcode } = req.params;
            const result = await Peminjaman.findOneAndUpdate({ barcode, status: "dipinjam" }, { status: "pending_pengembalian" }, { new: true });

            if (!result) {
                return this.error(res, "Peminjaman tidak ditemukan atau tidak dalam status dipinjam", 404);
            }

            this.success(res, "Pengembalian berhasil diproses. Silakan menuju meja admin untuk melakukan ACC pengembalian.", result);
        } catch (error) {
            this.error(res, "Internal Server Error", 500);
        }
    }

    cariPengembalian = async (req: Request, res: Response) => {
        try {
            const { barcode } = req.params;
            const peminjaman = await Peminjaman.findOne({ barcode, status: 'pending_pengembalian' });

            if (!peminjaman) {
                return this.error(res, "Peminjaman tidak ditemukan", 404);
            }

            this.success(res, "Berhasil mengambil data pengembalian", peminjaman);

        } catch (error) {
            this.error(res, "Internal Server Error", 500);
        }
    }

}

export default new PengembalianController();