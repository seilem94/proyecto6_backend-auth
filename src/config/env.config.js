import dotenv from 'dotenv'
dotenv.config();

export const env = {
  port: process.env.PORT || 3005,
  serverURL: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3005}`,
};
