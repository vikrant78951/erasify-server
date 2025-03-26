 import mongoose from "mongoose";

const connection = async (uri: string='') => {
  if (!uri) {
    throw new Error("Database connection URL not found");
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ Successfully connected to MongoDB!");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", (error as Error).message);
    throw new Error((error as Error).message);
  }
};

export default connection;
