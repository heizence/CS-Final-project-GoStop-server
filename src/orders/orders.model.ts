import * as mongoose from 'mongoose';
import Order from './order.interface';

const orderSchema = new mongoose.Schema(
  {
    verifiedId: { ref: 'User', type: mongoose.Schema.Types.ObjectId },
    item: { ref: 'Item', type: mongoose.Schema.Types.ObjectId },
    amount: { type: Number, default: 1 },
    totalPrice: { type: Number, required: true },
    payment: { type: String, default: 'coin', required: true },
    activity: { type: Boolean, default: true, required: true },
  },
  { _id: true, timestamps: true },
);

const orderModel = mongoose.model<Order & mongoose.Document>(
  'Order',
  orderSchema,
);

export default orderModel;
