import * as mongoose from 'mongoose';
import Habit from './habit.interface';

const habitSchema = new mongoose.Schema(
  {
    verifiedId: { ref: 'User', type: mongoose.Schema.Types.ObjectId },
    title: String,
    description: String,
    difficulty: { type: Number },
    alarm: { ref: 'Alarm', type: mongoose.Schema.Types.ObjectId },
    coin: { type: Number },
    point: { type: Number },
    health: { type: Number },
    positive: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
  },
  {
    _id: true,
    timestamps: true,
  },
);

const habitModel = mongoose.model<Habit & mongoose.Document>(
  'Habit',
  habitSchema,
);

export default habitModel;
