import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // Matches your user model's export name
    required: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product', // Matches your product model's export name
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// If already defined, reuse; otherwise define as `wishlist`
const wishlistModel =
  mongoose.models.wishlist || mongoose.model('wishlist', wishlistSchema);

export default wishlistModel;
