import { NextFunction, Request, Response } from "express";
import { IReqUser } from "../utils/interfaces";
import JWTService from "../utils/jwt";

export default class UserMiddleware {
    handle = (req: Request, res: Response, next: NextFunction) => {
        const authorization = req.headers.authorization;
        if (!authorization) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const [prefix, token] = authorization.split(" ");
        if (prefix !== "Bearer" || !token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
    
        const user = JWTService.getProfile(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        (req as unknown as IReqUser).user = user;
        next();
    }
}