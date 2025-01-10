import notificationModel from '../models/notificationModel.js';
import wishlistModel from '../models/wishlistModel.js';

// Notify users about discounted products
const sendDiscountNotifications = async (req, res) => {
  try {
    const { productIds, discountRate } = req.body;

    // Find all users with the product in their wishlist
    const wishlists = await wishlistModel.find({ products: { $in: productIds } });

    const notifications = [];
    for (const wishlist of wishlists) {
      const userId = wishlist.user;
      for (const productId of productIds) {
        const message = `A product in your wishlist is now ${discountRate}% off!`;

        notifications.push({ user: userId, product: productId, message });
      }
    }

    // Bulk insert notifications
    if (notifications.length) {
      await notificationModel.insertMany(notifications);
    }

    res.json({ success: true, message: 'Notifications sent successfully' });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ success: false, message: 'Error sending notifications' });
  }
};

// Fetch notifications for a user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await notificationModel
      .find({ user: userId })
      .populate('product', 'name price image')
      .sort({ createdAt: -1 });

    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
};

export { sendDiscountNotifications, getNotifications };
