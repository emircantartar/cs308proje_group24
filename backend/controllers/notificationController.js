import notificationModel from '../models/notificationModel.js';
import wishlistModel from '../models/wishlistModel.js';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import nodemailer from 'nodemailer';

// Create transporter for email
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email configuration is missing. Please check EMAIL_USER and EMAIL_PASS in .env file.');
  }

  return nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    debug: true, // Enable debug logs
    logger: true // Enable logger
  });
};

// Notify users about discounted products
const sendDiscountNotifications = async (req, res) => {
  try {
    const { productIds, discountRate } = req.body;

    // Find all users with the product in their wishlist
    const wishlists = await wishlistModel.find({ products: { $in: productIds } });

    // Get product details
    const products = await productModel.find({ _id: { $in: productIds } });
    const productMap = products.reduce((map, product) => {
      map[product._id.toString()] = product;
      return map;
    }, {});

    const notifications = [];
    const transporter = createTransporter();

    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('Email transporter verified successfully');
    } catch (error) {
      console.error('Email transporter verification failed:', error);
      throw new Error('Email configuration is invalid. Please check your Gmail credentials.');
    }

    for (const wishlist of wishlists) {
      const userId = wishlist.user;
      
      // Get user email
      const user = await userModel.findById(userId);
      if (!user || !user.email) {
        console.log(`Skipping notification for user ${userId}: No email found`);
        continue;
      }

      // For each discounted product in user's wishlist
      for (const productId of productIds) {
        if (!wishlist.products.includes(productId)) continue;

        const product = productMap[productId.toString()];
        if (!product) {
          console.log(`Skipping notification for product ${productId}: Product not found`);
          continue;
        }

        const message = `${product.name} in your wishlist is now ${discountRate}% off!`;
        const newPrice = product.price * (1 - discountRate / 100);

        // Create notification
        notifications.push({ 
          user: userId, 
          product: productId, 
          message,
          type: 'discount'
        });

        // Send email notification
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: '🔥 Price Drop Alert: Item in Your Wishlist is on Sale!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #e53e3e;">Special Discount Alert! 🎉</h2>
              <p>Great news! An item from your wishlist is now on sale:</p>
              
              <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3 style="margin: 0 0 10px 0;">${product.name}</h3>
                ${product.image ? `<img src="${product.image[0]}" alt="${product.name}" style="max-width: 200px; margin: 10px 0;">` : ''}
                <p style="color: #e53e3e; font-weight: bold; font-size: 1.2em;">
                  ${discountRate}% OFF!
                </p>
                <p>
                  <span style="text-decoration: line-through;">Original Price: $${product.price.toFixed(2)}</span><br>
                  <span style="color: #e53e3e; font-weight: bold;">New Price: $${newPrice.toFixed(2)}</span>
                </p>
              </div>

              <p>Don't miss out on this amazing deal! Visit our store to take advantage of this special offer.</p>
              
              <div style="margin-top: 20px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/product/${product._id}" 
                   style="background-color: #e53e3e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View Product
                </a>
              </div>

              <p style="color: #666; font-size: 0.9em; margin-top: 20px;">
                This is a limited-time offer. Prices and availability are subject to change.
              </p>
            </div>
          `
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`Discount email sent to ${user.email} for product ${product.name}`);
        } catch (error) {
          console.error(`Error sending discount email to ${user.email}:`, error);
          // Continue with other notifications even if one email fails
        }
      }
    }

    // Bulk insert notifications
    if (notifications.length) {
      await notificationModel.insertMany(notifications);
      console.log(`Created ${notifications.length} notifications`);
    } else {
      console.log('No notifications to create');
    }

    res.json({ success: true, message: 'Notifications and emails sent successfully' });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch notifications for a user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await notificationModel
      .find({ user: userId })
      .populate('product', 'name price image')
      .populate('order', '_id amount')
      .sort({ createdAt: -1 });

    // Format notifications based on type
    const formattedNotifications = notifications.map(notification => {
      const baseNotification = {
        _id: notification._id,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        type: notification.type
      };

      // Add type-specific data
      if (notification.type === 'discount' && notification.product) {
        baseNotification.product = {
          id: notification.product._id,
          name: notification.product.name,
          price: notification.product.price,
          image: notification.product.image
        };
      } else if (notification.type === 'refund' && notification.order) {
        baseNotification.order = {
          id: notification.order._id,
          amount: notification.order.amount
        };
      }

      return baseNotification;
    });

    res.json({ success: true, notifications: formattedNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
};

// Mark notifications as read
const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await notificationModel.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ success: false, message: 'Error marking notifications as read' });
  }
};

export { sendDiscountNotifications, getNotifications, markAsRead };
