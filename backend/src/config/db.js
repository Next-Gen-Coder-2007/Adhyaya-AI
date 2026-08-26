import mongoose from 'mongoose';
import { env } from './env.js';

let cachedPromise = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2 && cachedPromise) {
    return cachedPromise;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose
      .connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => {
        return m;
      })
      .catch((err) => {
        cachedPromise = null;
        console.error('[MongoDB Connection Error]', err.message);
        throw err;
      });
  }

  return cachedPromise;
}

export function getDBStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
}
