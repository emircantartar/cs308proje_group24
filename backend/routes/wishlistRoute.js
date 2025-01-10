import express from 'express';
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist
} from '../controllers/wishlistController.js';

import auth from '../middleware/auth.js'; 
// This should be your existing middleware that sets req.user

const router = express.Router();

// POST /api/wishlist - Add product to wishlist
router.post('/', auth, addToWishlist);

// GET /api/wishlist - Fetch all wishlist products
router.get('/', auth, getWishlist);

// DELETE /api/wishlist/:productId - Remove a single product
router.delete('/:productId', auth, removeFromWishlist);

// DELETE /api/wishlist - Clear the entire wishlist
router.delete('/', auth, clearWishlist);

export default router;
