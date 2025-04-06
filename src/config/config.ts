import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  TOKEN_KEY: string;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  DATABASE_URL: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 8000,
  TOKEN_KEY: process.env.FUTURE_BLINK_TOKEN_KEY || '',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
};

export default config;
