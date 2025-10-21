import jwt from "jsonwebtoken";
import { IUserToken } from "./interfaces";

export const generateToken = (user: IUserToken) => {
    const token = jwt.sign(user, process.env.JWT_SECRET_KEY as string, {
        expiresIn: "7d",
    });
    return token;
}

export const getProfile = (token: string) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as IUserToken;
    return decoded;
}