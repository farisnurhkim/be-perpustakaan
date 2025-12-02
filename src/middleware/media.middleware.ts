import multer from "multer";


class UploadMiddleware {
    private upload;

    constructor() {
        const storage = multer.memoryStorage();
        this.upload = multer({ storage });
    }

    single(fieldName: string) {
        return this.upload.single(fieldName);
    }
}

export default new UploadMiddleware();