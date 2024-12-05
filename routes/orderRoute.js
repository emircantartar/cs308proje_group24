import express from 'express'
import {placeOrder, allOrders, userOrders, updateStatus} from '../controllers/orderController.js'
import adminAuth  from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin Features
orderRouter.post('/list',adminAuth,allOrders)
orderRouter.post('/status',adminAuth,updateStatus)

// Payment Features
orderRouter.post('/place',authUser,placeOrder)


// User Feature 
orderRouter.post('/userorders',authUser,userOrders)



orderRouter.get("/invoice/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderModel.findById(orderId);

        if (!order || !order.invoicePath) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        res.sendFile(path.resolve(order.invoicePath));
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


import { sendInvoiceEmail } from '../controllers/orderController.js';

const router = express.Router();

// Send invoice email
router.post('/send-invoice', sendInvoiceEmail);







export default orderRouter