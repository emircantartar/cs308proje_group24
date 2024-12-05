import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

// Global variables
const currency = "inr";
const deliveryCharge = 10;

// Place an order
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address, paymentMethod, cardDetails } = req.body;

        // Validate paymentMethod
        if (!["cod", "card"].includes(paymentMethod)) {
            return res.status(400).json({ success: false, message: "Invalid payment method" });
        }

        // Construct order data
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod,
            cardDetails: paymentMethod === "card" ? cardDetails : undefined,
            payment: paymentMethod === "card", // Assume payment is successful for Credit Card
            date: Date.now(),
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Update product quantities
        for (const item of items) {
            const product = await productModel.findById(item._id);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product with ID ${item._id} not found` });
            }

            // Check stock availability
            if (product.quantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough stock for product: ${product.name}`,
                });
            }

            // Reduce product quantity
            product.quantity -= item.quantity;
            await product.save();
        }

        // Clear user cart
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Order Placed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// All Orders for Admin Panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});

        const enhancedOrders = orders.map((order) => ({
            ...order._doc,
            cardDetails: order.paymentMethod === "card" ? order.cardDetails : null,
        }));

        res.json({ success: true, orders: enhancedOrders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// User Orders Data
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;

        const orders = await orderModel.find({ userId });
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update Order Status
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Send Invoice Email
const sendInvoiceEmail = async (req, res) => {
    try {
        const { orderId, email } = req.body;

        // Fetch the order details
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Path to the generated invoice (assumes invoices are stored locally)
        const invoicePath = path.resolve(`invoices/invoice_${orderId}.pdf`);
        if (!fs.existsSync(invoicePath)) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        // Configure Nodemailer
        const transporter = nodemailer.createTransport({
            service: "Gmail", // Replace with your email service provider
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASS, // Your email password or app-specific password
            },
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender email
            to: email, // Recipient email
            subject: `Invoice for Order ${orderId}`,
            text: `Hi, please find attached your invoice for order ID ${orderId}.`,
            attachments: [
                {
                    filename: `invoice_${orderId}.pdf`,
                    path: invoicePath, // Path to the PDF file
                },
            ],
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ success: false, message: "Failed to send email" });
            }
            res.json({ success: true, message: "Invoice emailed successfully" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { placeOrder, allOrders, userOrders, updateStatus, sendInvoiceEmail };
