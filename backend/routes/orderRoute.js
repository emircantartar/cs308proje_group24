import express from "express";
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
    getReturnRequests,
    markItemAsReviewed, // NEW
} from "../controllers/orderController.js";

import adminAuth from "../middleware/adminAuth.js";
import { authUser, authUserOrAdmin } from "../middleware/auth.js";

const orderRouter = express.Router();

// Existing Routes
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/userorders", authUser, userOrders);
orderRouter.get("/invoice/:orderId", authUserOrAdmin, downloadInvoice);
orderRouter.post("/invoice/email", adminAuth, sendInvoiceEmail);
orderRouter.post("/invoices", adminAuth, getInvoices);

// Return Routes
orderRouter.post("/return/:orderId", authUser, requestReturn);
orderRouter.patch("/return/:orderId", adminAuth, updateReturnStatus);
orderRouter.get("/returns", adminAuth, getReturnRequests);

// NEW: Mark an item as reviewed
orderRouter.post("/reviewed/:orderId", authUser, markItemAsReviewed);

export default orderRouter;
