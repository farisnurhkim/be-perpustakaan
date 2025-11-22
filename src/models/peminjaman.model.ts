import mongoose from "mongoose";

export interface IPeminjaman extends mongoose.Document {
    barcode: string;
    id_user: mongoose.Types.ObjectId;
    tgl_pinjam: Date;
    batas_pinjam: Date;
    batas_ambil: Date;
    status: 'dipinjam' | 'dikembalikan' | 'terlambat';
    detail_peminjaman: Array<{
        id_buku: mongoose.Types.ObjectId;
        jumlah: number;
    }>;
}

const PeminjamanSchema = new mongoose.Schema<IPeminjaman>({
    barcode: { type: String, required: true, unique: true },
    id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tgl_pinjam: { type: Date, required: true, default: null },
    batas_pinjam: { type: Date, required: true },
    batas_ambil: { type: Date, required: true },
    status: {type: String, enum: ['dipinjam', 'dikembalikan', 'terlambat'], required: true, default: 'dipinjam' },
    detail_peminjaman: [{
        id_buku: { type: mongoose.Schema.Types.ObjectId, ref: 'Buku', required: true },
        jumlah: { type: Number, required: true },
    }]
}, {
    timestamps: true
});

const Peminjaman = mongoose.model('Peminjaman', PeminjamanSchema);

export default Peminjaman;