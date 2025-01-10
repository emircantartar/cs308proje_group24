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
    const userId = req.body.userId; // set by auth middleware

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

// 2) Update Return Status
export const updateReturnStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body; // 'approved', 'rejected', or 'refunded'

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!['approved', 'rejected', 'refunded'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved', 'rejected', or 'refunded'.",
      });
    }

    order.returnStatus = status;

    // If approved/refunded => put items back
    if (status === 'approved' || status === 'refunded') {
      for (const item of order.items) {
        const product = await productModel.findById(item._id);
        if (product) {
          product.quantity += item.quantity;
          await product.save();
        }
      }
    }

    // If 'refunded', handle payment gateway or credit
    if (status === 'refunded') {
      // e.g., console.log(`Issuing refund of $${order.refundAmount}...`);
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
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error streaming file' });
      }
    });

    // Optional: remove the file after streaming
    // fileStream.on('end', () => {
    //   fs.unlinkSync(pdfPath);
    // });
    
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
    const { userId, items, amount, address, paymentMethod, cardDetails } = req.body;

    if (!["cod", "card"].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod,
      cardDetails: paymentMethod === 'card' ? cardDetails : undefined,
      payment: paymentMethod === 'card',
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

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for product: ${product.name}`,
        });
      }

      product.quantity -= item.quantity;
      await product.save();
    }

    // Clear user cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: 'Order Placed' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
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
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
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
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const invoicePath = path.resolve(`invoices/invoice_${orderId}.pdf`);
    if (!fs.existsSync(invoicePath)) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Invoice for Order ${orderId}`,
      text: `Hi, please find attached your invoice for order ID ${orderId}.`,
      attachments: [
        {
          filename: `invoice_${orderId}.pdf`,
          path: invoicePath,
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to send email' });
      }
      res.json({ success: true, message: 'Invoice emailed successfully' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
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
