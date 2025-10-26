import mongoose from "mongoose";

export interface IBuku extends mongoose.Document {
    judul_buku: string;
    genre_buku: string;
    tahun_terbit: number;
    penulis: string;
    penerbit: string;
    stok: number;
    foto: string;
}

const BukuSchema = new mongoose.Schema<IBuku>({
    judul_buku: { type: String, required: true },
    genre_buku: { type: String, required: true },
    tahun_terbit: { type: Number, required: true },
    penulis: { type: String, required: true },
    penerbit: { type: String, required: true },
    stok: { type: Number, required: true },
    foto: { type: String, required: false, default: null },
}, {
    timestamps: true
});

const Buku = mongoose.model('Buku', BukuSchema);

export default Buku;