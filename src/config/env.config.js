import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3000;

export const env = {
  port,
  serverURL: process.env.SERVER_URL || `http://localhost:${port}`,
  nodeEnv: process.env.NODE_ENV || 'development',
  MongoDB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase',
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expire: process.env.JWT_EXPIRE || '7d'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  }
};
