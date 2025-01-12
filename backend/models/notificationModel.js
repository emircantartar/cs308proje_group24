import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'order' },
  message: { type: String, required: true },
  type: { type: String, enum: ['discount', 'refund'], required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const notificationModel =
  mongoose.models.notification || mongoose.model('notification', notificationSchema);

export default notificationModel;
