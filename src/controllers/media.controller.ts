import { Request, Response } from "express";
import Controller from "./controller";
import CloudinaryService from "../utils/uploader";

class MediaController extends Controller {
    single = async (req: Request, res: Response) => {
        if (!req.file) {
            return this.error(res, "No file uploaded", 400);
        }
        try {
            const result = await CloudinaryService.uploadImage(req.file as Express.Multer.File);
            this.success(res, "File uploaded successfully", result);
        } catch (error) {
            this.error(res, "File upload failed", 500);
        }
    }

    delete = async (req: Request, res: Response) => {
        const { fileUrl } = req.body;
        try {
            const result = await CloudinaryService.deleteImage(fileUrl);
            this.success(res, "File deleted successfully", result);
        } catch (error) {
            this.error(res, "File deletion failed", 500);
        }
    }
}

export default new MediaController();