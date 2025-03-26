

import { Request } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Define the upload directory
const uploadDir = path.join(process.cwd(), 'uploads');

// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, uploadDir);  
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// Export configured multer instance
export const upload = multer({ storage });

