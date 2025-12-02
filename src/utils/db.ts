import mongoose from 'mongoose';
import { MONGO_URI } from './env';

class Database {
    private isConnected: boolean = false;

    public async connect(): Promise<void> {
        if (this.isConnected) {
            console.log("Database already connected");
            return;
        }

        try {
            const conn = await mongoose.connect(MONGO_URI);
            this.isConnected = true;
            console.log(`MongoDB Connected: ${conn.connection.host}`);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`Error: ${message}`);
            process.exit(1);
        }
    }
}

export default new Database();