import mongoose from "mongoose";
import { env } from "./env.config.js";

const connectDB = async () => {
  try {
    const connnectionInstance = await mongoose.connect(`${env.MONGO_URI}`);
    console.log("MongoDb connected successfully ");
  } catch (error) {
    console.log("MongoDb connection failed " + error);
  }
};
export default connectDB;
