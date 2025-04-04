import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import router from './routes/routes';

const app = express();

app.use(express.json());

// Routes
app.use('/api', router);

// Error handling middleware
app.use(errorHandler);

export default app;
