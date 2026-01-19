
import mongoose from "mongoose";
import { env } from "../config/env.config.js";

export const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);

    await mongoose.connect(env.MongoDB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error de conexión a MongoDB: ${error.message}`);
    process.exit(1);
  }
};
