import mongoose from "mongoose";
import { Schema } from "mongoose";

interface Alamat {
    no_rumah: string;
    nama_jalan: string;
    kelurahan: string;
    kecamatan: string;
    kota: string;
}

export interface IUser extends mongoose.Document {
    nama: string;
    email: string;
    password: string;
    tgl_lahir: Date;
    alamat: Alamat;
    no_telp: string;
    status_user: "admin" | "member";
    di_blokir: boolean;
}

const userSchema = new Schema<IUser>({
    nama: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tgl_lahir: { type: Date, required: false, default: null },
    alamat: {
        no_rumah: { type: String, required: false, default: null },
        nama_jalan: { type: String, required: false, default: null },
        kelurahan: { type: String, required: false, default: null },
        kecamatan: { type: String, required: false, default: null },
        kota: { type: String, required: false, default: null },
    },
    no_telp: { type: String, required: false, default: null },
    status_user: { type: String, enum: ["admin", "member"], default: "member" },
    di_blokir: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;