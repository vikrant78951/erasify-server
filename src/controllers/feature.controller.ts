import { Request, Response } from "express";
import fs from "fs";
import User from "../model/user.model";
import GuestUser from "../model/guestUser.model";
import axios from "axios";
import dotenv from "dotenv";
import FormData from "form-data";
import path from "path";
dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email?: string;
    credits: number;
    role: "guest" | "non-active-user" | "active-user";
  };
}

export const removeBackground = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {

  try {
    const file = req.file;
    const mode = req.body.mode;
    const api_key = process.env.CLIPDROP_API_KEY;
    const api_url = "https://clipdrop-api.co/remove-background/v1";
    const user = req.user;
  debugger;

    if (!file) {
      res.status(400).json({
        success: false,
        message: "File not found",
      });
      return;
    }

    if (!user) {
      res.status(400).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (user.credits === 0) {
      res.status(400).json({
        success: false,
        message: "0 credits Left",
        credits: 0,
      });
      return;
    }

    const photo = fs.createReadStream(file.path);
    const form = new FormData();
    form.append("image_file", photo);
    let convertedImage = null;
    if (mode === "production") {
      // Call external API
      const response = await axios.post(api_url, form, {
        headers: {
          "x-api-key": api_key,
          ...form.getHeaders(),
        },
        responseType: "arraybuffer",
      });
      // Convert image to Base64
      const base64Image = Buffer.from(response.data, "binary").toString(
        "base64"
      );
      convertedImage = `data:${file.mimetype};base64,${base64Image}`;
    } else {
      // sample image
      const sampleImagePath = path.join(
        __dirname,
        "../../public/assets/images/sample.jpeg"
      );
      const sampleImage = fs.readFileSync(sampleImagePath);
      const base64Image = `data:image/jpeg;base64,${sampleImage.toString(
        "base64"
      )}`;
      convertedImage = `${base64Image}`;
    }

    // Deduct credits
    if (user.role === "guest") {
      await GuestUser.findByIdAndUpdate(user._id, { $inc: { credits: -1 } });
    } else {
      await User.findByIdAndUpdate(user._id, { $inc: { credits: -1 } });
    }

    res.status(200).json({
      success: true,
      message: "File converted",
      transformedImage: convertedImage,
      creditBalance: user.credits - 1,
    });
    
  } catch (error) {
    console.error("Background removal failed:", error);

    res.status(200).json({
      success: false,
      message: "",
      error: (error as Error).message,
    });
  }
};
