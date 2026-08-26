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

// Disable ETags and force fresh 200 OK status on all API responses
app.set('etag', false);
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

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

// Dynamic CORS Configuration supporting CLIENT_URL, Vercel, and Render deployments
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Check allowed origins list or any vercel.app / localhost / onrender.com origin
    if (
      env.ALLOWED_ORIGINS.includes('*') ||
      env.ALLOWED_ORIGINS.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com')
    ) {
      return callback(null, true);
    }

    // Check configured CLIENT_URL
    try {
      if (env.CLIENT_URL) {
        const clientHost = new URL(
          env.CLIENT_URL.startsWith('http') ? env.CLIENT_URL : `https://${env.CLIENT_URL}`
        ).origin;
        if (clientHost === origin) {
          return callback(null, true);
        }
      }
    } catch {
      // ignore url parse error
    }

    // Cloud permissive fallback
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Standard Body & Cookie Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serverless / Async DB Connection Middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    // DB connect failure handled gracefully by routes/errorHandler
  }
  next();
});

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
