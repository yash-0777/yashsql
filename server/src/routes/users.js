import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

// GET /api/users/favorites
router.get('/favorites', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id).populate('favorites');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ favorites: user.favorites });
});

export default router;

