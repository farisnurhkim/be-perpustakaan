import { Request, Response } from "express";
import * as Yup from "yup";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import { IReqUser } from "../utils/interfaces";
import { generateToken } from "../utils/jwt";
import { Types } from "mongoose";

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

const registerValidateSchema = Yup.object({
    nama: Yup.string().required("Nama is required"),
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Passwords must match").required("Confirm Password is required"),
})

export default {
    register: async (req: Request, res: Response) => {
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
                return res.status(400).json({ message: "Email sudah digunakan" });
            }

            const result = await User.create({
                nama,
                email,
                password: hashedPassword,
            })

            return res.status(200).json({
                message: "User registered successfully",
                data: result,
            })

        } catch (error) {
            return res.status(500).json({ message: "Internal server error", error });
        }

    },

    login: async (req: Request, res: Response) => {
        const { email, password } = req.body as unknown as LoginBody;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            const isPasswordValid: boolean = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            const token = generateToken({
                id: user._id as Types.ObjectId,
                nama: user.nama,
                status_user: user.status_user,
                email: user.email,
            });

            return res.status(200).json({
                message: "Login successful",
                data: token,
            });


        }catch (error) {
            return res.status(500).json({ message: "Internal server error", error });
        }
    },

    profile: async (req: Request, res: Response) => {
        try {
            const user = (req as unknown as IReqUser).user;
            const result = await User.findById(user?.id);
            return res.status(200).json({
                message: "User fetched successfully",
                data: result,
            })
            
        } catch (error) {
            return res.status(500).json({ message: "Internal server error", error });
        }
    },

    ubahProfil: async (req: Request, res: Response) => {
        const { nama, email, no_telp, tgl_lahir } = req.body;
        try {
            const { id } = req.params;
            const result = await User.findByIdAndUpdate(id, {
                nama,
                email,
                no_telp,
                tgl_lahir,
            }, {new: true});

            return res.status(200).json({
                message: "Profile kamu berhasil diubah",
                data: result,
            })

        } catch (error) {
            return res.status(500).json({ message: "Internal server error", error });
        }
    },

    blokirAkun: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const result = await User.findByIdAndUpdate(id, {
                di_blokir: true
            }, { new: true });
            return res.status(200).json({
                message: "Akun berhasil diblokir",
                data: result,
            })
        } catch (error) {
            return res.status(500).json({ message: "Internal server error", error });
        }
    }
}