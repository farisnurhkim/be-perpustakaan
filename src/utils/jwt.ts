import jwt from "jsonwebtoken";
import { IUserToken } from "./interfaces";



class JWTService {
    generateToken(user: IUserToken) {
        const token = jwt.sign(user, process.env.JWT_SECRET_KEY as string, {
            expiresIn: "7d",
        });
        return token;
    }

    getProfile(token: string) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as IUserToken;
        return decoded;
    }
}

export default new JWTService();