import mongoose from "mongoose";
import { IPengembalian } from "./pengembalian_model";

export interface IPeminjaman extends mongoose.Document {
    barcode: string;
    id_user: mongoose.Types.ObjectId;
    tgl_pinjam: Date;
    batas_pinjam: Date;
    batas_ambil: Date;
    status: 'dipinjam' | 'dikembalikan' | 'terlambat' | 'pending_pengembalian' | 'pending_peminjaman';
    detail_peminjaman: Array<{
        id_buku: mongoose.Types.ObjectId;
        jumlah: number;
    }>;
    pengembalian?: IPengembalian;
}

const PeminjamanSchema = new mongoose.Schema<IPeminjaman>({
    barcode: { type: String, required: true, unique: true },
    id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tgl_pinjam: { type: Date, required: true, default: null },
    batas_pinjam: { type: Date, required: true },
    batas_ambil: { type: Date, required: true },
    status: {type: String, enum: ['dipinjam', 'dikembalikan', 'terlambat', 'pending_pengembalian', 'pending_peminjaman'], required: true, default: 'pending_peminjaman' },
    detail_peminjaman: [{
        id_buku: { type: mongoose.Schema.Types.ObjectId, ref: 'Buku', required: true },
        jumlah: { type: Number, required: true },
    }]
}, {
    timestamps: true,
    toJSON: { 
        virtuals: true,
        transform(doc, ret: any) {
            if (ret.id_user) {
                ret.user = ret.id_user; // Pindahkan isi
                delete ret.id_user;     // Hapus field lama
            }
            return ret;
        },
     },
    toObject: { virtuals: true }
});

PeminjamanSchema.virtual('pengembalian', {
    ref: 'Pengembalian',
    localField: '_id',
    foreignField: 'id_peminjaman',
    justOne: true
});

const Peminjaman = mongoose.model('Peminjaman', PeminjamanSchema);

export default Peminjaman;