import * as mongoose from 'mongoose';
import Item from './item.interface';

const itemsSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    price: Number,
    itemImg: String,
    status: { type: Boolean, default: true },
  },
  {
    _id: true,
    timestamps: true,
  },
);

const itemModel = mongoose.model<Item & mongoose.Document>('Item', itemsSchema);

export default itemModel;
