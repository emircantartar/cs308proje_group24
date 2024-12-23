import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import nodemailer from "nodemailer";
import PDFDocument from 'pdfkit';
import fs from "fs";
import path from "path";

// Global variables
const currency = "$";
const deliveryCharge = 10;

// Generate PDF invoice
const generatePDF = async (order) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const invoicesDir = path.join(process.cwd(), 'invoices');
            const filePath = path.join(invoicesDir, `invoice_${order._id}.pdf`);

            // Ensure invoices directory exists
            if (!fs.existsSync(invoicesDir)) {
                fs.mkdirSync(invoicesDir, { recursive: true });
            }

            // Create write stream
            const writeStream = fs.createWriteStream(filePath);
            
            // Handle stream errors
            writeStream.on('error', (error) => {
                console.error('Write stream error:', error);
                reject(error);
            });

            // Pipe PDF to file
            doc.pipe(writeStream);

            // Add header
            doc.fontSize(24).text('INVOICE', { align: 'center' });
            doc.moveDown();
            
            // Add line
            doc.moveTo(50, doc.y)
               .lineTo(550, doc.y)
               .stroke();
            doc.moveDown();

            // Order details
            doc.fontSize(12);
            doc.text(`Order ID: ${order._id}`, { continued: true });
            doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, { align: 'right' });
            doc.moveDown(2);

            // Customer details
            doc.fontSize(14).text('Delivery Address', { underline: true });
            doc.fontSize(12).moveDown(0.5);
            // Format the address object
            if (typeof order.address === 'object') {
                // Helper function to check if a field has a meaningful value
                const isValidField = (value) => {
                    if (!value) return false;
                    if (typeof value !== 'string') return false;
                    if (value.toLowerCase().includes('select')) return false;
                    if (value === '-') return false;
                    return true;
                };

                try {
                    // Format each field if it has a valid value
                    const addressFields = {
                        'Street': order.address.street,
                        'City': order.address.city,
                        'State': order.address.state,
                        'Country': order.address.country,
                        'ZIP Code': order.address.zipCode
                    };

                    Object.entries(addressFields).forEach(([label, value]) => {
                        if (isValidField(value)) {
                            try {
                                // Try to clean and normalize the text
                                const cleanValue = value
                                    .replace(/[^\x00-\x7F]/g, char => {
                                        // Special handling for Turkish characters
                                        const turkishChars = {
                                            'İ': 'I',
                                            'ı': 'i',
                                            'Ğ': 'G',
                                            'ğ': 'g',
                                            'Ü': 'U',
                                            'ü': 'u',
                                            'Ş': 'S',
                                            'ş': 's',
                                            'Ö': 'O',
                                            'ö': 'o',
                                            'Ç': 'C',
                                            'ç': 'c'
                                        };
                                        return turkishChars[char] || char;
                                    });
                                doc.text(`${label}: ${cleanValue}`);
                            } catch (err) {
                                console.error(`Error formatting address field ${label}:`, err);
                                doc.text(`${label}: ${value}`);
                            }
                        }
                    });
                } catch (err) {
                    console.error('Error processing address fields:', err);
                    doc.text('Error formatting address');
                }
            } else if (order.address) {
                doc.text(String(order.address));
            } else {
                doc.text('No address provided');
            }
            doc.moveDown(2);

            // Items table header
            doc.fontSize(14).text('Order Items', { underline: true });
            doc.fontSize(12).moveDown(0.5);
            
            // Draw table header
            doc.font('Helvetica-Bold');
            doc.text('Item', 50, doc.y, { width: 250 });
            doc.text('Quantity', 300, doc.y, { width: 100 });
            doc.text('Price', 400, doc.y, { width: 100 });
            doc.moveDown();
            
            // Draw line under header
            doc.moveTo(50, doc.y)
               .lineTo(550, doc.y)
               .stroke();
            doc.moveDown(0.5);

            // Items table content
            doc.font('Helvetica');
            let totalAmount = 0;
            order.items.forEach(item => {
                const itemTotal = item.quantity * item.price;
                totalAmount += itemTotal;
                
                doc.text(item.name, 50, doc.y, { width: 250 });
                doc.text(item.quantity.toString(), 300, doc.y, { width: 100 });
                doc.text(`${currency}${Number(item.price).toFixed(2)}`, 400, doc.y, { width: 100 });
                doc.moveDown();
            });

            // Draw line above total
            doc.moveTo(50, doc.y)
               .lineTo(550, doc.y)
               .stroke();
            doc.moveDown();

            // Total amount
            doc.font('Helvetica-Bold');
            doc.text('Total Amount:', 300, doc.y);
            doc.text(`${currency}${Number(order.amount).toFixed(2)}`, 400, doc.y);
            doc.moveDown(2);

            // Payment details
            doc.fontSize(14).text('Payment Information', { underline: true });
            doc.fontSize(12).moveDown(0.5);
            doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`);
            doc.text(`Payment Status: ${order.payment ? 'Paid' : 'Pending'}`);

            // Footer
            doc.fontSize(10)
               .text(
                   'Thank you for your business!',
                   50,
                   doc.page.height - 50,
                   { align: 'center' }
               );

            // Handle document completion
            doc.on('end', () => {
                resolve(filePath);
            });

            // Finalize PDF
            doc.end();
        } catch (error) {
            console.error('PDF generation error:', error);
            reject(error);
        }
    });
};

// Download invoice as PDF
const downloadInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        console.log('Generating PDF for order:', orderId);

        // Generate PDF
        const pdfPath = await generatePDF(order);

        console.log('PDF generated at:', pdfPath);

        // Check if file exists
        if (!fs.existsSync(pdfPath)) {
            throw new Error('Generated PDF file not found');
        }

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.pdf`);

        // Stream the file
        const fileStream = fs.createReadStream(pdfPath);
        fileStream.pipe(res);

        // Handle stream errors
        fileStream.on('error', (error) => {
            console.error('File stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: "Error streaming file" });
            }
        });

        // Clean up file after sending (optional)
        fileStream.on('end', () => {
            // fs.unlinkSync(pdfPath);
        });

    } catch (error) {
        console.error('PDF generation/download error:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

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

// Get invoices in date range
const getInvoices = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        
        // Convert dates to timestamps since we store date as timestamp
        const startTimestamp = new Date(startDate).getTime();
        const endTimestamp = new Date(endDate).getTime() + (24 * 60 * 60 * 1000 - 1); // Include full end date
        
        const orders = await orderModel.find({
            date: {
                $gte: startTimestamp,
                $lte: endTimestamp
            }
        }).sort({ date: -1 });
        
        const invoices = orders.map(order => ({
            _id: order._id,
            orderId: order._id,
            date: order.date,
            total: order.amount,
            items: order.items,
            address: order.address,
            paymentMethod: order.paymentMethod,
            status: order.status
        }));
        
        res.json({
            success: true,
            invoices
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Calculate revenue and profit/loss
const calculateFinancials = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        
        if (!startDate || !endDate) {
            return res.json({ 
                success: false, 
                message: "Both start date and end date are required" 
            });
        }

        console.log('Calculating financials for:', { startDate, endDate });
        
        // Convert dates to timestamps
        const startTimestamp = new Date(startDate).getTime();
        const endTimestamp = new Date(endDate).getTime() + (24 * 60 * 60 * 1000 - 1); // Include full end date
        
        console.log('Converted timestamps:', { startTimestamp, endTimestamp });
        
        // Get all orders in date range
        const orders = await orderModel.find({
            date: {
                $gte: startTimestamp,
                $lte: endTimestamp
            }
        }).sort({ date: 1 }); // Sort by date ascending

        console.log(`Found ${orders.length} orders in date range`);
        
        // Group by date and calculate metrics
        const financials = {};
        orders.forEach(order => {
            const date = new Date(order.date).toISOString().split('T')[0];
            
            if (!financials[date]) {
                financials[date] = {
                    revenue: 0,
                    costs: 0,
                    profit: 0
                };
            }
            
            // Calculate revenue (total amount of order)
            const revenue = Number(order.amount) || 0;
            // Estimate costs as 70% of revenue for now
            const costs = revenue * 0.7;
            const profit = revenue - costs;
            
            financials[date].revenue += revenue;
            financials[date].costs += costs;
            financials[date].profit += profit;

            console.log(`Date ${date}: Revenue: ${revenue}, Costs: ${costs}, Profit: ${profit}`);
        });
        
        // Convert to arrays for the chart
        const dates = Object.keys(financials).sort();
        const revenue = dates.map(date => Math.round(financials[date].revenue * 100) / 100);
        const costs = dates.map(date => Math.round(financials[date].costs * 100) / 100);
        const profit = dates.map(date => Math.round(financials[date].profit * 100) / 100);
        
        console.log('Final calculations:', { dates, revenue, costs, profit });

        if (dates.length === 0) {
            return res.json({
                success: true,
                message: "No orders found in the selected date range",
                dates: [],
                revenue: [],
                profit: [],
                costs: []
            });
        }
        
        res.json({
            success: true,
            dates,
            revenue,
            profit,
            costs
        });
        
    } catch (error) {
        console.error('Financial calculation error:', error);
        res.json({ 
            success: false, 
            message: error.message || "Error calculating financials" 
        });
    }
};

export { placeOrder, allOrders, userOrders, updateStatus, sendInvoiceEmail, calculateFinancials, getInvoices, downloadInvoice };
