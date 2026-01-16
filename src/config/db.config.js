import mongoose from "mongoose";
import { env } from "../config/env.config.js";

export const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);

    await mongoose.connect(env.MongoDB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Base de datos conectada");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
