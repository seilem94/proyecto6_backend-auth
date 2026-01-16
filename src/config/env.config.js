import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3000;

export const env = {
  port,
  serverURL: process.env.SERVER_URL || `http://localhost:${port}`,
  MongoDB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key'
};
