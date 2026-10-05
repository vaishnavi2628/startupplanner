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

// Allowed frontend origins
const allowedOrigins = [
  'https://startupplanner.vercel.app',
  'http://localhost:5173',
  ...(process.env.CLIENT_URL || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
];

// Middleware
app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an origin
      // (Postman, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Auth routes
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
  authRoutes
);

// Plan routes
app.use('/api/plans', planRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
  });
});