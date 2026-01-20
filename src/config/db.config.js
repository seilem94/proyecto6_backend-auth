import mongoose from "mongoose";
import { env } from "../config/env.config.js";

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);

    const conn = await mongoose.connect(env.MongoDB_URI);
    
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error de conexión a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
