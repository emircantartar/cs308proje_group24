import express from 'express';
import { sendDiscountNotifications, getNotifications } from '../controllers/notificationController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// POST /api/notifications/send - Send notifications for discounted products
router.post('/send', auth, sendDiscountNotifications);

// GET /api/notifications - Fetch notifications for the logged-in user
router.get('/', auth, getNotifications);

export default router;
