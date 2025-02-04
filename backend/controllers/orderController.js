import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import nodemailer from "nodemailer";
import PDFDocument from 'pdfkit';
import fs from "fs";
import path from "path";
import notificationModel from "../models/notificationModel.js";

// Global variables
const currency = "$";
const deliveryCharge = 10;



// NEW: Mark an item in an order as reviewed
export const markItemAsReviewed = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { productId } = req.body;
        const userId = req.user._id;

        // Find the order
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Check if the order belongs to the user
        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to modify this order" });
        }

        // Check if the order is delivered
        if (order.status !== "Delivered") {
            return res.status(400).json({ success: false, message: "Order is not delivered yet" });
        }

        // Check if the item is in the order
        const orderedItem = order.items.find((item) => item._id.toString() === productId);
        if (!orderedItem) {
            return res.status(400).json({ success: false, message: "Product not found in this order" });
        }

        // If item hasn't been reviewed before, mark it as reviewed
        const isAlreadyReviewed = order.reviewedItems.some(item => item.toString() === productId.toString());
        if (!isAlreadyReviewed) {
            order.reviewedItems.push(productId);
            await order.save();
        }

        res.json({ success: true, message: "Item review status updated", order });
    } catch (error) {
        console.error("Error marking item as reviewed:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// Generate PDF invoice
const generatePDF = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const invoicesDir = path.join(process.cwd(), 'backend', 'invoices');
      const filePath = path.join(invoicesDir, `invoice_${order._id}.pdf`);

      // Ensure invoices directory exists
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      // Create a write stream
      const writeStream = fs.createWriteStream(filePath);

      // Handle stream errors
      writeStream.on('error', (error) => {
        console.error('Write stream error:', error);
        reject(error);
      });

      // Pipe the PDF document to the write stream
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

      if (typeof order.address === 'object') {
        const isValidField = (value) => {
          if (!value) return false;
          if (typeof value !== 'string') return false;
          if (value.toLowerCase().includes('select')) return false;
          if (value === '-') return false;
          return true;
        };

        try {
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
                // Replace special chars (Turkish, etc.)
                const cleanValue = value.replace(/[^\x00-\x7F]/g, (char) => {
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

      // Table header
      doc.font('Helvetica-Bold');
      doc.text('Item', 50, doc.y, { width: 250 });
      doc.text('Quantity', 300, doc.y, { width: 100 });
      doc.text('Price', 400, doc.y, { width: 100 });
      doc.moveDown();

      // Line under header
      doc.moveTo(50, doc.y)
         .lineTo(550, doc.y)
         .stroke();
      doc.moveDown(0.5);

      // Table content
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

      // Line above total
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
      doc.fontSize(10).text(
        'Thank you for your business!',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

      // On 'end', resolve with the file path
      doc.on('end', () => {
        resolve(filePath);
      });

      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error('PDF generation error:', error);
      reject(error);
    }
  });
};

// ====================== RETURN/REFUND FUNCTIONS ======================

// 1) Request Return
export const requestReturn = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;  // Get userId from auth middleware

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check ownership
    if (String(order.userId) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to return this order' });
    }

    // 30-day window
    const daysSincePurchase = (Date.now() - order.date) / (1000 * 3600 * 24);
    if (daysSincePurchase > 30) {
      return res.status(400).json({ success: false, message: 'Return window (30 days) has expired' });
    }

    // Mark as pending
    order.returnRequested = true;
    order.returnStatus = 'pending';
    order.refundAmount = order.amount;

    await order.save();

    return res.json({
      success: true,
      message: 'Return request submitted successfully',
      order,
    });
  } catch (error) {
    console.error('requestReturn error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

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

// 2) Update Return Status
export const updateReturnStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, refundAmount } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update order status
    order.returnStatus = status;
    if (refundAmount) {
      order.refundAmount = refundAmount;
    }

    try {
      // Get user email
      const user = await userModel.findById(order.userId);
      if (!user || !user.email) {
        console.log(`No email found for user ${order.userId}`);
        throw new Error('User email not found');
      }

      let notificationMessage = '';
      let emailSubject = '';
      let emailTemplate = '';

      // Set notification and email content based on status
      switch (status) {
        case 'approved':
          // Update product quantities
          for (const item of order.items) {
            const product = await productModel.findById(item._id);
            if (product) {
              product.quantity += item.quantity;
              await product.save();
            }
          }

          notificationMessage = `Your return request for order #${order._id} has been approved. Refund amount: ${currency}${order.refundAmount || order.amount}`;
          emailSubject = 'Return Request Approved ✅';
          emailTemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #e53e3e;">Return Request Approved! ✅</h2>
              <p>Good news! Your return request has been approved.</p>
              
              <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3 style="margin: 0 0 10px 0;">Return Details</h3>
                <p><strong>Order ID:</strong> #${order._id}</p>
                <p><strong>Refund Amount:</strong> ${currency}${order.refundAmount || order.amount}</p>
                <p><strong>Status:</strong> Approved</p>
              </div>

              <p>Your refund will be processed according to your original payment method. Please allow 5-10 business days for the refund to appear in your account.</p>
              
              <div style="margin-top: 20px;">
                <p style="color: #666;">If you have any questions about your refund, please don't hesitate to contact our customer support team.</p>
              </div>

              <p style="color: #666; font-size: 0.9em; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
                Thank you for shopping with us!
              </p>
            </div>
          `;
          break;

        case 'rejected':
          notificationMessage = `Your return request for order #${order._id} has been rejected.`;
          emailSubject = 'Return Request Update ❌';
          emailTemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #e53e3e;">Return Request Update</h2>
              <p>We have reviewed your return request for order #${order._id}.</p>
              
              <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3 style="margin: 0 0 10px 0;">Return Details</h3>
                <p><strong>Order ID:</strong> #${order._id}</p>
                <p><strong>Status:</strong> Rejected</p>
              </div>

              <p>Unfortunately, we are unable to accept your return request at this time. This could be due to one or more of the following reasons:</p>
              <ul style="color: #666;">
                <li>The return window has expired</li>
                <li>The item condition does not meet our return policy requirements</li>
                <li>The item is not eligible for return as per our policy</li>
              </ul>
              
              <div style="margin-top: 20px;">
                <p style="color: #666;">If you would like to discuss this further or have any questions, please contact our customer support team.</p>
              </div>

              <p style="color: #666; font-size: 0.9em; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
                Thank you for your understanding.
              </p>
            </div>
          `;
          break;

        case 'refunded':
          notificationMessage = `Your refund for order #${order._id} has been processed. Amount: ${currency}${order.refundAmount || order.amount}`;
          emailSubject = 'Refund Processed 💰';
          emailTemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #e53e3e;">Refund Processed Successfully! 💰</h2>
              <p>Great news! Your refund has been processed and is on its way.</p>
              
              <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3 style="margin: 0 0 10px 0;">Refund Details</h3>
                <p><strong>Order ID:</strong> #${order._id}</p>
                <p><strong>Refund Amount:</strong> ${currency}${order.refundAmount || order.amount}</p>
                <p><strong>Status:</strong> Processed</p>
              </div>

              <p>The refund has been initiated to your original payment method. Please note that it may take 5-10 business days for the amount to appear in your account, depending on your bank's processing time.</p>
              
              <div style="margin-top: 20px;">
                <p style="color: #666;">If you don't see the refund in your account after 10 business days, please contact our customer support team.</p>
              </div>

              <p style="color: #666; font-size: 0.9em; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
                Thank you for your patience throughout this process!
              </p>
            </div>
          `;
          break;
      }

      if (notificationMessage) {
        // Create notification
        const notification = new notificationModel({
          user: order.userId,
          order: order._id,
          type: 'refund',
          message: notificationMessage,
        });
        await notification.save();
        console.log('Return status notification created successfully');

        // Create and verify email transporter
        const transporter = createTransporter();
        try {
          await transporter.verify();
          console.log('Email transporter verified successfully');
        } catch (error) {
          console.error('Email transporter verification failed:', error);
          throw new Error('Email configuration is invalid');
        }

        // Send email notification
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: emailSubject,
          html: emailTemplate
        };

        await transporter.sendMail(mailOptions);
        console.log(`Return status email sent to ${user.email}`);
      }
    } catch (error) {
      console.error('Error handling notifications:', error);
      // Don't fail the whole request if notifications fail
    }

    await order.save();

    return res.json({
      success: true,
      message: `Return status updated to '${status}'`,
      order,
    });
  } catch (error) {
    console.error('updateReturnStatus error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3) Get Return Requests
export const getReturnRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.returnStatus = status; // e.g. 'pending'
    } else {
      filter.returnRequested = true;
    }

    const orders = await orderModel.find(filter);
    return res.json({ success: true, returns: orders });
  } catch (error) {
    console.error('getReturnRequests error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== INVOICE LOGIC ======================
export const downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization - allow both admin and order owner
    const isAdmin = req.userRole === 'admin' || req.userRole === 'sales_manager' || req.userRole === 'product_manager';
    const isOwner = String(order.userId) === String(req.user?._id);
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this order' });
    }

    console.log('Generating PDF for order:', orderId);
    const pdfPath = await generatePDF(order);
    console.log('PDF generated at:', pdfPath);

    if (!fs.existsSync(pdfPath)) {
      throw new Error('Generated PDF file not found');
    }

    // Force download in the browser
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.pdf`);

    const fileStream = fs.createReadStream(pdfPath);
    
    // Handle file stream errors
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error streaming file' });
      }
    });

    // Clean up the file after sending
    fileStream.on('end', () => {
      try {
        fs.unlinkSync(pdfPath);
      } catch (error) {
        console.error('Error cleaning up PDF file:', error);
      }
    });

    // Pipe the file to the response
    fileStream.pipe(res);

  } catch (error) {
    console.error('PDF generation/download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// ====================== ORDER CREATION & MANAGEMENT ======================
export const placeOrder = async (req, res) => {
  try {
    const { address, items, amount, paymentMethod } = req.body;
    const userId = req.user._id;  // Get userId from auth middleware

    // Update product quantities
    for (const item of items) {
      const product = await productModel.findById(item._id);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Product ${item.name} not found` 
        });
      }
      
      // Check if enough quantity is available
      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Not enough stock for ${item.name}. Available: ${product.quantity}` 
        });
      }

      // Decrease the product quantity
      await productModel.findByIdAndUpdate(
        item._id,
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Create new order with consistent status naming
    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
      paymentMethod,
      date: Date.now(),
      status: "Order Placed", // Using consistent status naming
      payment: paymentMethod === 'cod' ? false : true
    });

    await newOrder.save();

    // Clear user's cart after order placement
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order Placed Successfully" });

  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    const enhancedOrders = orders.map((order) => ({
      ...order._doc,
      cardDetails: order.paymentMethod === 'card' ? order.cardDetails : null,
    }));

    res.json({ success: true, orders: enhancedOrders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const userOrders = async (req, res) => {
  try {
    const userId = req.user._id;  // Get userId from auth middleware
    const orders = await orderModel.find({ userId }).sort({ date: -1 });  // Sort by date, newest first
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    // Find the order first
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if order is cancelled
    if (order.status.toLowerCase() === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot update status of a cancelled order' 
      });
    }

    // Update the status if not cancelled
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: 'Status Updated' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const sendInvoiceEmail = async (req, res) => {
  try {
    const { orderId, email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const order = await orderModel.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization - allow both admin and order owner
    const isAdmin = req.userRole === 'admin' || req.userRole === 'sales_manager' || req.userRole === 'product_manager';
    const isOwner = String(order.userId) === String(req.user._id);
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this order' });
    }

    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing');
      return res.status(500).json({ 
        success: false, 
        message: 'Email service not properly configured. Please contact support.' 
      });
    }

    // Generate the invoice PDF
    const pdfPath = await generatePDF(order);

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: true, // Enable debug logs
      logger: true // Enable logger
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (error) {
      console.error('Email transporter verification failed:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Email service configuration error. Please try again later.' 
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Invoice for Order ${orderId}`,
      text: `Hi, please find attached your invoice for order ID ${orderId}.`,
      attachments: [
        {
          filename: `invoice_${orderId}.pdf`,
          path: pdfPath,
        },
      ],
    };

    // Use Promise-based email sending
    await transporter.sendMail(mailOptions);
    
    // Clean up the PDF file after sending
    try {
      fs.unlinkSync(pdfPath);
    } catch (error) {
      console.error('Error cleaning up PDF file:', error);
    }

    res.json({ success: true, message: 'Invoice emailed successfully' });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email. Please check your email configuration or try again later.' 
    });
  }
};

// =============== INVOICES & FINANCIALS ===============
export const getInvoices = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime() + (24 * 60 * 60 * 1000 - 1);

    const orders = await orderModel
      .find({
        date: {
          $gte: startTimestamp,
          $lte: endTimestamp,
        },
      })
      .sort({ date: -1 });

    const invoices = orders.map((order) => ({
      _id: order._id,
      orderId: order._id,
      date: order.date,
      total: order.amount,
      items: order.items,
      address: order.address,
      paymentMethod: order.paymentMethod,
      status: order.status,
    }));

    res.json({
      success: true,
      invoices,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const calculateFinancials = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.json({
        success: false,
        message: 'Both start date and end date are required',
      });
    }

    console.log('Calculating financials for:', { startDate, endDate });

    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp =
      new Date(endDate).getTime() + (24 * 60 * 60 * 1000 - 1);

    console.log('Converted timestamps:', { startTimestamp, endTimestamp });

    const orders = await orderModel
      .find({
        date: {
          $gte: startTimestamp,
          $lte: endTimestamp,
        },
      })
      .sort({ date: 1 });

    console.log(`Found ${orders.length} orders in date range`);

    const financials = {};
    orders.forEach((order) => {
      const dateKey = new Date(order.date).toISOString().split('T')[0];

      if (!financials[dateKey]) {
        financials[dateKey] = {
          revenue: 0,
          costs: 0,
          profit: 0,
        };
      }

      const revenue = Number(order.amount) || 0;
      const costs = revenue * 0.7; // example cost assumption
      const profit = revenue - costs;

      financials[dateKey].revenue += revenue;
      financials[dateKey].costs += costs;
      financials[dateKey].profit += profit;

      console.log(
        `Date ${dateKey}: Revenue: ${revenue}, Costs: ${costs}, Profit: ${profit}`
      );
    });

    const dates = Object.keys(financials).sort();
    const revenue = dates.map(d => Math.round(financials[d].revenue * 100) / 100);
    const costs = dates.map(d => Math.round(financials[d].costs * 100) / 100);
    const profit = dates.map(d => Math.round(financials[d].profit * 100) / 100);

    console.log('Final calculations:', { dates, revenue, costs, profit });

    if (dates.length === 0) {
      return res.json({
        success: true,
        message: 'No orders found in the selected date range',
        dates: [],
        revenue: [],
        profit: [],
        costs: [],
      });
    }

    res.json({
      success: true,
      dates,
      revenue,
      profit,
      costs,
    });
  } catch (error) {
    console.error('Financial calculation error:', error);
    res.json({
      success: false,
      message: error.message || 'Error calculating financials',
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        // Find the order
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Check if the order belongs to the user
        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to cancel this order" });
        }

        // Check if order can be cancelled based on status (case-insensitive)
        const currentStatus = order.status.toLowerCase().trim();
        const allowedStatuses = ["placed", "order placed", "packing"];
        const canCancel = allowedStatuses.some(status => currentStatus.includes(status));

        if (!canCancel) {
            return res.status(400).json({ 
                success: false, 
                message: "Order cannot be cancelled. Orders can only be cancelled before shipping." 
            });
        }

        // Restore product quantities
        for (const item of order.items) {
            await productModel.findByIdAndUpdate(
                item._id,
                { $inc: { quantity: item.quantity } }
            );
        }

        // Update order status to cancelled
        order.status = "cancelled";
        await order.save();

        res.json({ 
            success: true, 
            message: "Order cancelled successfully",
            order 
        });
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
