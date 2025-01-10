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
  // NEW:
  getReturnRequests
} from '../controllers/orderController.js';

import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';
// If you're not using path or orderModel directly here, you can remove these imports.
// import path from 'path';
// import orderModel from '../models/orderModel.js';

const orderRouter = express.Router();

// ===================== EXISTING ROUTES =====================
orderRouter.post('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateStatus);
orderRouter.post('/place', authUser, placeOrder);
orderRouter.post('/userorders', authUser, userOrders);
orderRouter.get('/invoice/:orderId', adminAuth, downloadInvoice);
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
