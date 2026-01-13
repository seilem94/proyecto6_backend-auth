import dotenv from 'dotenv'
dotenv.config();

export const env = {
  isProd: process.env.IS_PROD,
  port: process.env.PORT || 3000,
};
