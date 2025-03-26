import mongoose from "mongoose";



const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  credit: {
    type: Number,
    default: 5,
  },
  uuid:{
    type:String,
    unique:true
  },
  role : {
    type:String,
     default : 'non-active-user'
  }
});



export default mongoose.model("User", userSchema);
