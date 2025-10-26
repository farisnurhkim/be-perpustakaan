import { Request, Response } from "express";
import uploader from "../utils/uploader";

export default {
    async single (req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        try {
            const result = await uploader.uploadImage(req.file as Express.Multer.File);
            res.status(200).json({ message: "File uploaded successfully", data: result });
        } catch (error) {
            res.status(500).json({ message: "Failed to upload file", error });
        }
    },

    async delete (req: Request, res: Response) {
        const { fileUrl } = req.body;
        try {
            const result = await uploader.deleteImage(fileUrl);
            res.status(200).json({ message: "File deleted successfully", data: result });
        } catch (error) {
            res.status(500).json({ message: "Failed to delete file", error });
        }
    }
}