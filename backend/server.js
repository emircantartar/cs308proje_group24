import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import wishlistRouter from './routes/wishlistRoute.js';
import notificationRouter from './routes/notificationRoute.js';

const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB and Cloudinary
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Frontend and Admin URLs
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
  })
);

// Debug incoming headers (for troubleshooting)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Incoming Headers:', req.headers);
  next();
});

// API endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/notifications', notificationRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.send('API Working');
});

// Start server
app.listen(port, () => console.log(`Server started on PORT: ${port}`));
