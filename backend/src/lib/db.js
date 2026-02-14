import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const MONGO_URI = ENV.MONGO_URI;
    if (!MONGO_URI)
      throw new Error("MONGO_URI is not defined in environment variables");

    const conn = await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully:", conn.connection.host);
  } catch (error) {
    console.error("MongoDBconnection error:", error);
    process.exit(1); // Exit process with failure
  }
};
