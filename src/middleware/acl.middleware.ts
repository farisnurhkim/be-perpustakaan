import { NextFunction, Request, Response } from "express"
import { IReqUser } from "../utils/interfaces"

export default class ACLMiddleware {

    handle = (roles: string[]) => {
        return (req: Request, res: Response, next: NextFunction) => {
            const role = (req as unknown as IReqUser).user?.status_user;
            if (!role || !roles.includes(role)) {
                return res.status(403).json({ message: "Forbidden" });
            }
            next();
        }
    }
}