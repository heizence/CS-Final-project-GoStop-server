import * as express from 'express';
import Controller from '../interfaces/controller.interface';
import CreateRewardDto from './reward.dto';
import Reward from './reward.interface';
import rewardModel from './rewards.model';
import validationMiddleware from '../middleware/validation.middleware';
import authMiddleware from '../middleware/auth.middleware';
import ReqWithUser from '../interfaces/reqWithUser.interface';
import NotFoundException from '../exceptions/NotFoundException';

class RewardsController implements Controller {
  public path = '/rewards';
  public router = express.Router();
  private reward = rewardModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.getAllRewards);
    this.router.get(`${this.path}/:id`, this.getRewardById);
    this.router
      .all(`${this.path}/*`, authMiddleware)
      .patch(
        `${this.path}/:id`,
        validationMiddleware(CreateRewardDto, true),
        this.modifyReward,
      )
      .delete(`${this.path}/:id`, this.deleteReward)
      .post(
        this.path,
        authMiddleware,
        validationMiddleware(CreateRewardDto),
        this.createReward,
      );
  }

  private getAllRewards = async (
    req: express.Request,
    res: express.Response,
  ) => {
    const rewards = await this.reward
      .find()
      .populate('verifiedId', '-password');
    res.send(rewards);
  };

  private getRewardById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.params.id;
    const reward = await this.reward
      .findById(id)
      .populate('verifiedId', '_id name');
    if (reward) res.send(reward);
    else next(new NotFoundException(id, this.path));
  };

  private modifyReward = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.params.id;
    const rewardData: Reward = req.body;
    const reward = await this.reward.findByIdAndUpdate(id, rewardData, {
      new: true,
    });
    if (reward) res.send(reward);
    else next(new NotFoundException(id, this.path));
  };

  private deleteReward = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.params.id;
    const successResponse = await this.reward.findByIdAndDelete(id);
    if (successResponse) res.send(200);
    else next(new NotFoundException(id, this.path));
  };

  private createReward = async (req: ReqWithUser, res: express.Response) => {
    const rewardData: CreateRewardDto = req.body;
    const createdReward = new this.reward({
      ...rewardData,
      verifiedId: req.user._id,
    });
    const savedReward = await createdReward.save();
    await savedReward.populate('verifiedId', '-password').execPopulate();
    res.status(201).send('OK');
  };
}

export default RewardsController;
