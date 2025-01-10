import wishlistModel from '../models/wishlistModel.js';
import productModel from '../models/productModel.js';

// Add a product to the wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const { productId } = req.body;

    const productExists = await productModel.findById(productId);
    if (!productExists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let wishlist = await wishlistModel.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new wishlistModel({ user: userId, products: [] });
    }

    const alreadyInWishlist = wishlist.products.some((pid) => pid.toString() === productId);
    if (alreadyInWishlist) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }

    wishlist.products.push(productId);
    await wishlist.save();

    return res.json({ success: true, message: 'Product added to wishlist', wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error adding product to wishlist' });
  }
};

// Fetch wishlist items
const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const wishlist = await wishlistModel
      .findOne({ user: userId })
      .populate('products', 'name price image') // Populate specific fields
      .exec();

    if (!wishlist) {
      return res.json({ success: true, products: [], message: 'No wishlist found for this user' });
    }

    return res.json({ success: true, products: wishlist.products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching wishlist' });
  }
};

// Remove a product from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const wishlist = await wishlistModel.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter((pid) => pid.toString() !== productId);
    await wishlist.save();

    return res.json({ success: true, message: 'Product removed from wishlist', wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error removing product' });
  }
};

// Clear entire wishlist
const clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const wishlist = await wishlistModel.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.products = [];
    await wishlist.save();

    return res.json({ success: true, message: 'Wishlist cleared', wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error clearing wishlist' });
  }
};

export { addToWishlist, getWishlist, removeFromWishlist, clearWishlist };
