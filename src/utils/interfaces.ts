import { Types } from "mongoose";

export interface IUserToken{
    id?: Types.ObjectId;
    nama: string;
    status_user: "admin" | "member";
    email: string;
}

export interface IReqUser extends Request {
    user?: IUserToken;
}