import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://localhost:8000',
];

const envOrigins = process.env.ALLOWED_ORIGINS || '';
const customOrigins = envOrigins
  ? envOrigins.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

export const env = {
  PROJECT_NAME: 'Adhyaya AI',
  VERSION: '2.2.0',
  PORT: parseInt(process.env.PORT || '8000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  MONGODB_URI:
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    'mongodb://127.0.0.1:27017/adhyaya_ai',

  // Security
  SECRET_KEY: process.env.SECRET_KEY || 'adhyaya_ai_super_secret_jwt_key_2026_production',
  ALGORITHM: process.env.ALGORITHM || 'HS256',
  ACCESS_TOKEN_EXPIRE_DAYS: 7,

  // AI & External APIs
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || '',
  GOOGLE_URL: process.env.GOOGLE_URL || 'https://www.googleapis.com/oauth2/v3/userinfo',

  // CORS
  ALLOWED_ORIGINS: Array.from(new Set([...defaultOrigins, ...customOrigins])),
};
