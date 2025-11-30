import { Response } from "express";

export default class Controller {
  success(res: Response, message: string, data: any, code = 200) {
    return res.status(code).json({
      success: true,
      message,
      data,
    });
  }

  error(res: Response, message: string, code = 500) {
    return res.status(code).json({
      success: false,
      message,
    });
  }
}