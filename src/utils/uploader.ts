import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from "./env";

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
})

const toDataUrl = (file: Express.Multer.File): string => {
    const b64 = file.buffer.toString("base64");
    const dataUrl = `data:${file.mimetype};base64,${b64}`;
    return dataUrl;
}

const getPublicIdFromUrl = (url: string): string => {
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    const publicId = filename.split(".")[0];
    return `perpustakaan/images/${publicId}`;
}

export default {
    async uploadImage(file: Express.Multer.File) {
        const fileDataUrl = toDataUrl(file);
        const result = await cloudinary.uploader.upload(fileDataUrl, {
            folder: "perpustakaan/images",
            resource_type: "auto"
        });
        return result.secure_url;
    },

    async deleteImage(imageUrl: string) {
        const publicId = getPublicIdFromUrl(imageUrl);
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image"
        });
        return result
    }
}