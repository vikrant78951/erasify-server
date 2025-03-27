import Razorpay from "razorpay";
import { Request, Response } from "express";
import User from "../model/user.model";
import TransactionModel from "../model/transaction.model";

interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    email?: string;
    credits: number;
  };
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

async function paymentControler(req: Request, res: Response): Promise<void> {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const planId = Number(req.body?.planId) || 0;
    const user = authenticatedReq.user;
    const existingUser = await User.findById(user._id);

    if (!existingUser) {
      res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    let credits: number, plan: string, amount: number;
    switch (planId) {
      case 1:
        plan = "Basic";
        credits = 10;
        amount = 100;
        break;
      case 2:
        plan = "Advance";
        credits = 50;
        amount = 500;
        break;
      case 3:
        plan = "Enterprise";
        credits = 100;
        amount = 1000;
        break;
      default:
        res.status(400).json({
          success: false,
          message: "Invalid plan ID",
        });
        return;
    }

    const date = Date.now();
    const newTransaction = new TransactionModel({
      userId: user._id,
      plan,
      amount,
      credits,
      date,
    });

    const transaction = await newTransaction.save();

    if (!transaction) {
      res.status(500).json({
        success: false,
        message: "Failed to create transaction",
      });
      return;
    }

    const options = {
      amount: amount * 100,
      currency: process.env.CURRENCY || "INR",
      receipt: transaction._id.toString(),
    };

    razorpay.orders.create(options, (error, order) => {
      if (error) {
        res.status(400).json({
          success: false,
          message: "Failed to create order",
          error: error || "An unknown error occurred",
        });
      } else {
        res.status(200).json({
          success: true,
          message: "Order generated",
          order,
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
}



async function verifyPayment(req: Request, res: Response): Promise<void> {
  try {
    const { razorpay_payment_id, razorpay_order_id } = req.body;
    debugger
    if (!razorpay_payment_id ) {
      res.status(400).json({
        success: false,
        message: "Missing payment id",
      });
      return;
    }

    const paymentInfo = await razorpay.payments.fetch(razorpay_payment_id);
    const orderInfo = await razorpay.orders.fetch(razorpay_order_id);

    if (orderInfo.status !== "paid") {
      res.status(400).json({
        success: false,
        message: "Payment not completed",
        orderInfo,
      });
      return;
    }

    const transactionData = await TransactionModel.findById(orderInfo.receipt);
    if (!transactionData) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    const userData = await User.findById(transactionData.userId);
    if (!userData) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (transactionData.payment) {
      res.status(400).json({
        success: false,
        message: "Payment already processed",
      });
      return;
    }

    const updatedCredits = userData.credits + transactionData.credits;
    await User.findByIdAndUpdate(userData._id, { credits: updatedCredits });
    await TransactionModel.findByIdAndUpdate(transactionData.id, {
      payment: true,
    });

    res.status(200).json({
      success: true,
      message: "Credits added successfully",
      credits: updatedCredits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the Razorpay payment",
      error: (error as Error).message,
    });
  }
}



export { paymentControler, verifyPayment };
