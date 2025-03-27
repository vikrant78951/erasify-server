import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { ObjectId } from "mongoose";
dotenv.config();

interface TokenPayload {
  _id: ObjectId;
  email: string;
}

const at = process.env.JWT_ACCCESS_SECRET || "";
const rt = process.env.JWT_REFRESH_SECRET || "";

const createAccessToken = (data   : TokenPayload) => {
  try {
    const { email, _id } = data;
    if (!email) {
      throw new Error("Can't create access token: email not found");
    }
    if (!at) {
      throw new Error("Can't create access token: access secret key not found");
    }
    return jwt.sign(
      {
        email: email,
        id: _id.toString(),
      },
      at,
      { expiresIn: "15s" }
    );
  } catch (error) {
    throw error;
  }
};

const createRefreshToken = (data   : TokenPayload) => {
  try {
    const { email, _id,  } = data;
    if (!email) {
      throw new Error("Can't create refresh token: email not found");
    }
    if (!rt) {
      throw new Error(
        "Can't create refresh token: refresh secret key not found"
      );
    }
    return jwt.sign(
      {
        email: email,
        id: _id.toString(),
      },
      rt,
      { expiresIn: "7d" }
    );
  } catch (error) {
    throw error;
  }
};


export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, at , { expiresIn: "15m" });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, rt , {
    expiresIn: "7d",
  });
};


const getUserData = (user: any) => ({
  _id: user._id.toString(),   
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  credits: user.credits
});

const verifyAccessToken =  (token : string) => {
  if (!at) {
    throw new Error("Can't verify access token: access secret key not found");
  }
  try {
    const decoded =  jwt.verify(token, at);
    if (typeof decoded === "object" && decoded.exp) {
      return decoded.exp * 1000 < Date.now() ? null : decoded;
    }
  } catch (error) {
    return null;
  }
};

const verifyRefreshToken = (token : string) => {
  if (!rt) {
    throw new Error("Can't verify refresh token: refresh secret key not found");
  }
  try {
    const decoded = jwt.verify(token, rt);
    if (typeof decoded === "object" && decoded.exp) {
      return decoded.exp * 1000 < Date.now() ? null : decoded;
    }
  } catch (error) {
    return null;
  }
};


export {
  createAccessToken,
  createRefreshToken,
  getUserData,
  verifyAccessToken,
  verifyRefreshToken
};
