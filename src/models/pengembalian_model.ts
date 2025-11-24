import mongoose from "mongoose";

export interface IPengembalian extends mongoose.Document {
    id_peminjaman: mongoose.Types.ObjectId;
    tgl_kembali: Date;
    denda: number;
    keterangan: string;
}

const PengembalianSchema = new mongoose.Schema<IPengembalian>({
    id_peminjaman: { type: mongoose.Schema.Types.ObjectId, ref: 'Peminjaman', required: true },
    tgl_kembali: { type: Date, required: true, default: Date.now },
    denda: { type: Number, required: true, default: 0 },
    keterangan: { type: String, required: true, default: "" },
}, {
    timestamps: true
});

const Pengembalian = mongoose.model('Pengembalian', PengembalianSchema);

export default Pengembalian;