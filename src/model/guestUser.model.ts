import mongoose from "mongoose";


export interface User {
  firstName: number;
  lastName: string;
  email: string;
  password: string;
  createdAt: string;
  credit: string;
}

const guestUserSchema = new mongoose.Schema({

  uuid: { type: String, required: true, unique: true },
  fingerprint : { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  role : {
    type : String,
    default : 'guest'
  },
  credit: {
    type: Number,
    default: 5,
  },
});




export default mongoose.model("GuestUser", guestUserSchema);
