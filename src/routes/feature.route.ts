import express from 'express'
import { upload } from "../middleware/multer.middleware";

import {
    removeBackground
} from '../controllers/feature.controller'
import { authenticateUser } from '../middleware/auth.middleware';

const router = express.Router();


router.post('/remove-background',upload.single('file'),authenticateUser,removeBackground)

export default router