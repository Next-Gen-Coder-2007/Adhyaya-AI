import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

function createToken(payload) {
  return jwt.sign(payload, env.SECRET_KEY, {
    expiresIn: `${env.ACCESS_TOKEN_EXPIRE_DAYS}d`,
  });
}

function setAuthCookie(res, token) {
  const isProd = env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  res.cookie('access_token', token, {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    maxAge: env.ACCESS_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
  });
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ detail: 'Email and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ detail: 'An account with this email already exists.' });
    }

    const hashedPassword = await User.hashPassword(password);
    const user = new User({
      name: name || 'Adhyaya Scholar',
      email: email.toLowerCase(),
      password: hashedPassword,
      provider: 'local',
    });

    await user.save();
    return res.status(201).json({ message: 'Registered successfully.' });
  } catch (err) {
    console.error('[AUTH:REGISTER ERROR]', { message: err.message, stack: err.stack });
    if (err.name === 'MongooseError' || err.message?.includes('buffering timed out')) {
      return res.status(503).json({
        detail: 'Database connection timed out. Please verify MongoDB Atlas IP whitelist (0.0.0.0/0) and environment variables.',
      });
    }
    return res.status(500).json({ detail: err.message || 'Registration failed due to a server error.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ detail: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ detail: 'Invalid email or password.' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ detail: 'Invalid email or password.' });
    }

    const token = createToken({ sub: user.email });
    setAuthCookie(res, token);

    return res.status(200).json({ message: 'Login success', token, user: user.toJSON() });
  } catch (err) {
    console.error('[AUTH:LOGIN ERROR]', { message: err.message, stack: err.stack });
    if (err.name === 'MongooseError' || err.message?.includes('buffering timed out')) {
      return res.status(503).json({
        detail: 'Database connection timed out. Please verify MongoDB Atlas IP whitelist (0.0.0.0/0) and environment variables.',
      });
    }
    return res.status(500).json({ detail: err.message || 'Login failed due to a server error.' });
  }
}

export async function googleLogin(req, res) {
  try {
    const { access_token } = req.body;
    if (!access_token) {
      return res.status(400).json({ detail: 'Google access token is required.' });
    }

    const googleRes = await fetch(env.GOOGLE_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!googleRes.ok) {
      return res.status(401).json({ detail: 'Invalid or expired Google OAuth access token.' });
    }

    const userInfo = await googleRes.json();
    const email = userInfo.email;
    const name = userInfo.name || 'Google User';

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = new User({
        name,
        email: email.toLowerCase(),
        provider: 'google',
      });
      await user.save();
    }

    const token = createToken({ sub: user.email });
    setAuthCookie(res, token);

    return res.status(200).json({ message: 'Google login success', token, user: user.toJSON() });
  } catch (err) {
    console.error('[AUTH:GOOGLE ERROR]', { message: err.message, stack: err.stack });
    if (err.name === 'MongooseError' || err.message?.includes('buffering timed out')) {
      return res.status(503).json({
        detail: 'Database connection timed out. Please verify MongoDB Atlas IP whitelist (0.0.0.0/0).',
      });
    }
    return res.status(500).json({ detail: err.message || 'Google authentication failed.' });
  }
}

export async function getMe(req, res) {
  return res.status(200).json({
    email: req.user.email,
    name: req.user.name,
    provider: req.user.provider,
    settings: req.user.settings || {},
  });
}

export async function logout(req, res) {
  res.clearCookie('access_token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
  });
  return res.status(200).json({ message: 'Logged out' });
}

export async function updateProfile(req, res) {
  try {
    const user = req.user;
    const { name, email, password } = req.body;

    if (user.provider === 'google' && (email || password)) {
      return res.status(403).json({
        detail: 'Google users cannot update email or password. Only name is editable.',
      });
    }

    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ detail: 'Email already in use' });
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (password) user.password = await User.hashPassword(password);

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        email: user.email,
        name: user.name,
        provider: user.provider,
      },
    });
  } catch (err) {
    console.error('[UPDATE PROFILE ERROR]', err);
    return res.status(500).json({ detail: err.message || 'Failed to update profile' });
  }
}

export async function updateSettings(req, res) {
  try {
    const user = req.user;
    const incomingSettings = req.body || {};

    const currentSettings = { ...(user.settings || {}) };

    if (incomingSettings.darkMode !== undefined) currentSettings.darkMode = incomingSettings.darkMode;
    if (incomingSettings.themeColor !== undefined) currentSettings.themeColor = incomingSettings.themeColor;
    if (incomingSettings.fontSize !== undefined) currentSettings.fontSize = incomingSettings.fontSize;
    if (incomingSettings.layoutMode !== undefined) currentSettings.layoutMode = incomingSettings.layoutMode;

    user.settings = currentSettings;
    await user.save();

    return res.status(200).json({
      message: 'Settings updated successfully',
      settings: user.settings,
    });
  } catch (err) {
    console.error('[UPDATE SETTINGS ERROR]', err);
    return res.status(500).json({ detail: err.message || 'Failed to update settings' });
  }
}
