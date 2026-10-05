import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import planRoutes from './routes/planRoutes.js';
import { notFound, errorHandler } from './middleware/error.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy .env.example to .env and set it.');
  process.exit(1);
}

const app = express();
app.use(helmet());
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',') }));
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), authRoutes);
app.use('/api/plans', planRoutes);
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
});
