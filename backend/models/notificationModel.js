import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const notificationModel =
  mongoose.models.notification || mongoose.model('notification', notificationSchema);

export default notificationModel;
