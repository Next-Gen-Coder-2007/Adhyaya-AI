import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { errorHandler } from './src/middleware/errorHandler.js';

import healthRoutes from './src/routes/healthRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import courseRoutes from './src/routes/courseRoutes.js';

const app = express();

// Telemetry & Process Time Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  res.send = function (...args) {
    if (!res.headersSent) {
      res.setHeader('X-Process-Time', `${Date.now() - start}ms`);
    }
    return originalSend.apply(res, args);
  };
  next();
});

// Dynamic CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (env.ALLOWED_ORIGINS.includes('*') || env.ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive cloud origin fallback
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  })
);

// Standard Body & Cookie Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Mount API Routes
app.use('/', healthRoutes);
app.use('/auth', authRoutes);
app.use('/courses', courseRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server & Connect Database
export function startServer() {
  connectDB().catch(() => {});
  return app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
