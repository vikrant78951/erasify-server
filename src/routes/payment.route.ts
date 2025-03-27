import express from 'express'
import {paymentControler,verifyPayment} from '../controllers/payment.controller';
import { authenticateUser } from '../middleware/auth.middleware';
const router = express.Router();


router.post("/order", authenticateUser, paymentControler);
router.post("/verify", authenticateUser, verifyPayment);


export default router;
