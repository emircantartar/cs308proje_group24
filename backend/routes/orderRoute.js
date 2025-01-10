import express from 'express';
import {
  placeOrder,
  allOrders,
  userOrders,
  updateStatus,
  sendInvoiceEmail,
  calculateFinancials,
  getInvoices,
  downloadInvoice,
  requestReturn,
  updateReturnStatus,
  getReturnRequests
} from '../controllers/orderController.js';

import adminAuth from '../middleware/adminAuth.js';
import { authUser, authUserOrAdmin } from '../middleware/auth.js';

const orderRouter = express.Router();

// ===================== EXISTING ROUTES =====================
orderRouter.post('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateStatus);
orderRouter.post('/place', authUser, placeOrder);
orderRouter.post('/userorders', authUser, userOrders);
orderRouter.get('/invoice/:orderId', authUserOrAdmin, downloadInvoice);
orderRouter.post('/invoice/email', adminAuth, sendInvoiceEmail);
orderRouter.post('/invoices', adminAuth, getInvoices);
orderRouter.post('/analytics/revenue', adminAuth, calculateFinancials);

// ===================== NEW ROUTES FOR RETURNS =====================

// (A) User requests a return
orderRouter.post('/return/:orderId', authUser, requestReturn);

// (B) Admin/Manager updates the return status (approved/rejected/refunded)
orderRouter.patch('/return/:orderId', adminAuth, updateReturnStatus);

// (C) Admin/Manager fetches return requests (e.g. ?status=pending)
orderRouter.get('/returns', adminAuth, getReturnRequests);

export default orderRouter;
