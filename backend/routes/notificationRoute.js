import express from 'express';
import { sendDiscountNotifications, getNotifications, markAsRead } from '../controllers/notificationController.js';
import { authUser } from '../middleware/auth.js';

const router = express.Router();

// POST /api/notifications/send - Send notifications for discounted products
router.post('/send', authUser, sendDiscountNotifications);

// GET /api/notifications - Fetch notifications for the logged-in user
router.get('/', authUser, getNotifications);

// PUT /api/notifications/read - Mark all notifications as read
router.put('/read', authUser, markAsRead);

export default router;
