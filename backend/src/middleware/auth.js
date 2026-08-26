import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

export async function requireAuth(req, res, next) {
  let token = req.cookies?.access_token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      detail: 'Authentication required. No session cookie found.',
    });
  }

  try {
    const payload = jwt.verify(token, env.SECRET_KEY);
    const email = payload.sub || payload.email;

    if (!email) {
      return res.status(401).json({ detail: 'Invalid token payload.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ detail: 'User account not found.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      detail: 'Session token has expired or is invalid.',
    });
  }
}
