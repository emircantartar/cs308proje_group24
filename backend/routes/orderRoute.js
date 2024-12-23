import express from 'express'
import { placeOrder, allOrders, userOrders, updateStatus, sendInvoiceEmail, calculateFinancials, getInvoices, downloadInvoice } from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'
import path from 'path'
import orderModel from '../models/orderModel.js'

const orderRouter = express.Router()

// Admin Features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)

// Payment Features
orderRouter.post('/place', authUser, placeOrder)

// User Feature 
orderRouter.post('/userorders', authUser, userOrders)

// Invoice Features
orderRouter.get('/invoice/:orderId', adminAuth, downloadInvoice);

// Sales Manager Features
orderRouter.post('/invoice/email', adminAuth, sendInvoiceEmail);
orderRouter.post('/invoices', adminAuth, getInvoices);
orderRouter.post('/analytics/revenue', adminAuth, calculateFinancials);

export default orderRouter