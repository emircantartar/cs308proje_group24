import express from 'express';
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist
} from '../controllers/wishlistController.js';

import { authUser } from '../middleware/auth.js';

const router = express.Router();

// POST /api/wishlist - Add product to wishlist
router.post('/', authUser, addToWishlist);

// GET /api/wishlist - Fetch all wishlist products
router.get('/', authUser, getWishlist);

// DELETE /api/wishlist/:productId - Remove a single product
router.delete('/:productId', authUser, removeFromWishlist);

// DELETE /api/wishlist - Clear the entire wishlist
router.delete('/', authUser, clearWishlist);

export default router;
