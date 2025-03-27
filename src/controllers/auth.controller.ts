import User from "../model/user.model";
import GuestUser from "../model/guestUser.model";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { COOKIE_OPTIONS, CONSTANTS } from "../constants/constants";
import { createGuestUser } from "../utils/guestUser";
import {
  getUserData,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.util";

const saltRounds = 10;

/**
 * User Registration
 */

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    debugger;
    const { email, password, lastName, firstName } = req.body;
    let { uuid } = req.cookies; // Get UUID from cookies

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: "User already exists" });
      return;
    }

    let guestUser = await GuestUser.findOne({ uuid });

    // If no guest user found, create a new guest user and assign a UUID
    if (!guestUser) {
      uuid = crypto.randomUUID(); // Generate new UUID
      guestUser = new GuestUser({ uuid, credits: 1 });
      await guestUser.save();

      // Set the new UUID in cookies
      res.cookie("uuid", uuid, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiry
      });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, saltRounds);

    // Create new user and sync guest credits
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashPassword,
      credits: guestUser.credits,
      uuid, // Assign the guest UUID
    });

    await user.save();

    // Generate access & refresh tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Set authentication cookies
    res.cookie(CONSTANTS.ACCESS_TOKEN, accessToken, COOKIE_OPTIONS.accessToken);
    res.cookie(
      CONSTANTS.REFRESH_TOKEN,
      refreshToken,
      COOKIE_OPTIONS.refreshToken
    );

    res.status(200).json({
      success: true,
      message: "User registered successfully",
      user,
      token: accessToken,
    });
  } catch (error) {
    console.error("Register Error:", (error as Error).message);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
      error: (error as Error).message,
    });
  }
};


/**
 * User Login
 */
const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "User not found!" });
      return;
    }

    if (!user.password) {
      res.status(400).json({ message: "Password not found!" });
      return;
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ message: "Invalid password!" });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.cookie(CONSTANTS.ACCESS_TOKEN, accessToken, COOKIE_OPTIONS.accessToken);
    res.cookie(
      CONSTANTS.REFRESH_TOKEN,
      refreshToken,
      COOKIE_OPTIONS.refreshToken
    );

    res.status(200).json({
      message: "Logged in successfully",
      user: getUserData(user),
    });
  } catch (error) {
    console.error("Login Error:", (error as Error).message);
    res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
};

/**
 * User Logout
 */
const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie(CONSTANTS.ACCESS_TOKEN, COOKIE_OPTIONS.clearAccessToken);
    res.clearCookie(CONSTANTS.REFRESH_TOKEN, COOKIE_OPTIONS.clearRefreshToken);
    res.clearCookie(CONSTANTS.UUID, COOKIE_OPTIONS.uuid);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", (error as Error).message);
    res.status(500).json({
      message: "Logout failed. Please try again.",
    });
  }
};

/**
 * User Session
 */
const sessionHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fingerprint } = req.body;
    const accessToken = req.cookies.erasify_access_token;
    const refreshToken = req.cookies.erasify_refresh_token;
    const uuid = req.cookies.uuid;

    if (accessToken) {
      try {
        const decoded = verifyAccessToken(accessToken) as { userId: string };
        const user = await User.findById(decoded.userId).select("-password");
        if (user) {
          res.json({ success: true, user });
          return;
        }
      } catch (error) {
        console.log("Invalid Access Token");
      }
    }

    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken) as { userId: string };
        const user = await User.findById(decoded.userId).select("-password");
        if (user) {
          const newAccessToken = generateAccessToken(user._id.toString());
          res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
          });
          res.json({ success: true, user });
          return;
        }
      } catch (error) {
        console.log("Invalid Refresh Token");
      }
    }

    if (uuid) {
      const guestUser = await GuestUser.findOne({ uuid });
      if (guestUser) {
        res.cookie("uuid", guestUser.uuid, {
          httpOnly: true,
        
        });
        res.json({ success: true, user: guestUser });
        return;
      }
    }

    if (fingerprint) {
      let guestUser = await GuestUser.findOne({ fingerprint });
      if (!guestUser) {
        guestUser = await createGuestUser(fingerprint);
      }
      res.cookie("uuid", guestUser.uuid, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json({ success: true, user: guestUser });
      return;
    }

    res.status(400).json({ success: false, message: "Invalid session" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export { register, login, logout, sessionHandler };
