import { Request, Response } from "express";
import * as Yup from "yup";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import { IReqUser } from "../utils/interfaces";
import { Types } from "mongoose";
import Controller from "./controller";
import JWTService from "../utils/jwt";

type RegisterBody = {
    nama: string;
    email: string;
    password: string;
    confirmPassword: string;
}

type LoginBody = {
    email: string;
    password: string;
}

type AlamatBody = {
    no_rumah: string;
    nama_jalan: string;
    kelurahan: string;
    kecamatan: string;
    kota: string;
}

const registerValidateSchema = Yup.object({
    nama: Yup.string().required("Nama is required"),
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Passwords must match").required("Confirm Password is required"),
})

class UserController extends Controller {
    register = async (req: Request, res: Response) => {
        const { nama, email, password, confirmPassword } = req.body as unknown as RegisterBody;
        try {
            await registerValidateSchema.validate({
                nama,
                email,
                password,
                confirmPassword
            });
            const hashedPassword = await bcrypt.hash(password, 10);

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return this.error(res, "Email sudah terdaftar", 400);
            }

            const result = await User.create({
                nama,
                email,
                password: hashedPassword,
            })

            return this.success(res, "Registrasi berhasil!", result);

        } catch (error) {
            return this.error(res, "Internal server error", 500);
        }

    }

    login = async (req: Request, res: Response) => {
        const { email, password } = req.body as unknown as LoginBody;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return this.error(res, "Invalid email or password", 400);
            }

            const isPasswordValid: boolean = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return this.error(res, "Invalid email or password", 400);
            }

            const token = JWTService.generateToken({
                id: user._id as Types.ObjectId,
                nama: user.nama,
                status_user: user.status_user,
                email: user.email,
            });

            return this.success(res, "Login successful", token);


        } catch (error) {
            return this.error(res, "Internal server error", 500);
        }
    }

    profile = async (req: Request, res: Response) => {
        try {
            const user = (req as unknown as IReqUser).user;
            const result = await User.findById(user?.id);
            return this.success(res, "User fetched successfully", result);

        } catch (error) {
            return this.error(res, "Internal server error", 500);
        }
    }

    ubahProfil = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { nama, email, no_telp, password } = req.body;

            const updateData: any = {};

            if (nama) updateData.nama = nama;
            if (email) updateData.email = email;
            if (no_telp) updateData.no_telp = no_telp;

            if (password) {
                if (password.length < 6) {
                    return this.error(res, "Password harus memiliki minimal 6 karakter", 400);
                }
                const salt = 10;

                updateData.password = await bcrypt.hash(password, salt);
            }

            const result = await User.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            ).select('-password');

            if (!result) {
                return this.error(res, "User tidak ditemukan", 404);
            }

            return this.success(res, "Profile kamu berhasil diubah", result);

        } catch (error: any) {
            if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
                return this.error(res, "Email sudah terdaftar, silakan gunakan email lain.", 400);
            }
            return this.error(res, "Internal server error", 500);
        }
    }


    ubahAlamat = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { no_rumah, nama_jalan, kelurahan, kecamatan, kota } = req.body as unknown as AlamatBody;

        try {
            const result = await User.findByIdAndUpdate(id, {
                alamat: {
                    no_rumah,
                    nama_jalan,
                    kelurahan,
                    kecamatan,
                    kota
                }
            }, { new: true });

            return this.success(res, "Alamat berhasil diubah", result);

        } catch (error) {
            return this.error(res, "Internal server error", 500);
        }
    }
}

export default new UserController();