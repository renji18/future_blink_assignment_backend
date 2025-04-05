import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler';
import router from './routes/routes';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    exposedHeaders: ['set-cookie'],
  }),
);

// Routes
app.use('/api', router);

// Error handling middleware
app.use(errorHandler);

export default app;
