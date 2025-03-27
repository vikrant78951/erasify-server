import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {type: String,required: true},
  plan: {type: String,required: true},
  amount: { type: Number, required: true },
  payment: { type: Boolean, default: false },
  credits: { type: Number, required: true },
  date: { type: Number },
});



export default mongoose.models.transaction || mongoose.model("Transaction", transactionSchema);
