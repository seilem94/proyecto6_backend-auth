import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: process.env.PORT || 3000,
  serverURL: process.env.SERVER_URL || `http://localhost:${this.port}`,
  MongoDB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase',
};
