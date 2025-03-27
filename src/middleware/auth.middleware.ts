import { Request, Response, NextFunction } from "express";
import User from "../model/user.model";
import GuestUser from "../model/guestUser.model";
import {
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.util";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email?: string;
    credits: number;
    role: string;
  };
}


import { RequestHandler } from "express";

export const authenticateUser: RequestHandler = async (
req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {

    let accessToken = req.cookies.erasify_access_token;
    const refreshToken = req.cookies.erasify_refresh_token;
    const uuid = req.cookies.uuid;

    if (!accessToken && !refreshToken && !uuid) {
      res.status(401).json({ success: false, message: "Unauthorized User" });
      return
    }

    if (accessToken) {
      let decoded = verifyAccessToken(accessToken);
      if (decoded && decoded?.userId) {
        const user = await User.findById(decoded?.userId);
        if (user) {
          req.user = {
            _id: user._id.toString(),
            email: user.email,
            credits: user.credits,
            role: user.role,
          };
          next();
          return
        }
      }
    }

    if (refreshToken) {
      let decoded = verifyRefreshToken(refreshToken);
      if (decoded && decoded?.userId) {
        const user = await User.findById(decoded?.userId);
        if (user) {
          req.user = {
            _id: user._id.toString(),
            email: user.email,
            credits: user.credits,
            role: user.role,
          };
          next();
          return
        }
      }
    }

    if (uuid) {
      const user = await GuestUser.findOne({ uuid });
      if (user) {
        req.user = {
          _id: user._id.toString(),
          credits: user.credits,
          role: user.role,
        };
        next();
        return
      }
    }

    res.status(400).json({
      status: false,
      message: "Unauthorized User",
    });
    return
  } catch (error) {
     res.status(400).json({
       status: false,
       message: "Unauthorized",
       error : (error as Error).message
     });
  
  }
};
