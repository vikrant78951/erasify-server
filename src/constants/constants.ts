import { Request } from "express";

// Interfaces
export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "none" | "strict" | "lax";
  maxAge?: number;
}

// Constants
export const CONSTANTS = {
  FRONTEND_URL: ["http://localhost:5173", "https://erasify-client.vercel.app"],
  ACCESS_TOKEN: "erasify_access_token",
  REFRESH_TOKEN: "erasify_refresh_token",
  UUID: "uuid",
}; ;

// API Routes 
export const API_ROUTES = {
  BASE: "/api/v1/",
  AUTH: "/api/v1/auth",
  FEATURES: "/api/v1/features",
} as const;

// Default Cookie Options
export const COOKIE_OPTIONS : {
  accessToken: CookieOptions;
  refreshToken: CookieOptions;
  uuid: CookieOptions;
  clearAccessToken: CookieOptions;
  clearRefreshToken: CookieOptions;
} = {
  accessToken: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000,
  },
  refreshToken: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
  uuid: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  },
  clearAccessToken: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 0,
  },
  clearRefreshToken: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 0,
  },
};

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email?: string;
    name?: string;
    isGuestUser: boolean;
    [key: string]: any;
  };
}