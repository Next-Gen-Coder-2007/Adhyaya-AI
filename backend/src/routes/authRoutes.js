import { Router } from 'express';
import {
  register,
  login,
  googleLogin,
  getMe,
  logout,
  updateProfile,
  updateSettings,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', requireAuth, getMe);
router.post('/logout', logout);
router.put('/me', requireAuth, updateProfile);
router.patch('/me/settings', requireAuth, updateSettings);

export default router;
