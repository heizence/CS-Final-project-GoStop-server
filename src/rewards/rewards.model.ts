import * as mongoose from 'mongoose';
import Reward from './reward.interface';

const rewardSchema = new mongoose.Schema(
  {
    verifiedId: { ref: 'User', type: mongoose.Schema.Types.ObjectId },
    title: String,
    description: String,
    coin: { type: Number },
  },
  { _id: true, timestamps: true },
);

const rewardModel = mongoose.model<Reward & mongoose.Document>(
  'Reward',
  rewardSchema,
);

export default rewardModel;
