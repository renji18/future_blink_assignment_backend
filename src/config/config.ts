import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  TOKEN_KEY: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 8000,
  TOKEN_KEY: process.env.FUTURE_BLINK_TOKEN_KEY || '',
};

export default config;
