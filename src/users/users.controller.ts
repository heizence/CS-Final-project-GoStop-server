import * as express from 'express';
import Controller from '../interfaces/controller.interface';
import authMiddleware from '../middleware/auth.middleware';
import validationMiddleware from '../middleware/validation.middleware';
import adminMiddleware from '../middleware/admin.middleware';
import ReqWithUser from '../interfaces/reqWithUser.interface';
import todoModel from '../todos/todos.model';
import habitModel from '../habits/habits.model';
import rewardModel from '../rewards/rewards.model';
import orderModel from '../orders/orders.model';
import userModel from './user.model';
import CreateUserDto from './user.dto';
import User from './user.interface';
import NotFoundException from '../exceptions/NotFoundException';

class UserController implements Controller {
  public path = '/users';
  public router = express.Router();
  private todo = todoModel;
  private habit = habitModel;
  private reward = rewardModel;
  private order = orderModel;
  private user = userModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .all(`${this.path}/*`, authMiddleware)
      .get(`${this.path}/todos`, this.getAllTodosOfUser)
      .get(`${this.path}/habits`, this.getAllHabitsOfUser)
      .get(`${this.path}/rewards`, this.getAllRewardsOfUser)
      .get(`${this.path}/shop`, this.getAllOrdersOfUser)
      .get(`${this.path}/hasItems`, this.getAllItemsOfUser)
      // user info modify delete
      .get(`${this.path}/info`, this.getInfoOfUser)
      .patch(
        `${this.path}/:id`,
        validationMiddleware(CreateUserDto, true),
        this.modifyUser,
      )
      .delete(`${this.path}/:id`, adminMiddleware, this.deleteUser);
  }

  private getAllTodosOfUser = async (
    req: ReqWithUser,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const userId = req.user._id;
    const todos = await this.todo.find({ verifiedId: userId });
    res.send({ count: todos.length, user: userId, todos: todos });
  };

  private getAllHabitsOfUser = async (
    req: ReqWithUser,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const userId = req.user._id;
    const habits = await this.habit.find({ verifiedId: userId });
    res.send({ count: habits.length, user: userId, habits: habits });
  };

  private getAllRewardsOfUser = async (
    req: ReqWithUser,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const userId = req.user._id;
    const rewards = await this.reward.find({ verifiedId: userId });
    res.send({ count: rewards.length, user: userId, rewards: rewards });
  };

  private getAllOrdersOfUser = async (
    req: ReqWithUser,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const userId = req.user._id;
    const orders = await this.order.find({ verifiedId: userId });
    res.send({ count: orders.length, user: userId, orders: orders });
  };

  private getAllItemsOfUser = async (
    req: ReqWithUser,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const userId = req.user._id;
    const hasItems = await this.order
      .find({ verifiedId: userId })
      .populate('item', 'category itemImg');
    res.send({ count: hasItems.length, user: userId, hasItems: hasItems });
  };

  private getInfoOfUser = async (
    req: ReqWithUser,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.user._id;
    const user = await this.user.findById(id);
    if (user) res.send(user);
    else next(new NotFoundException(id, this.path));
  };

  private modifyUser = async (
    req: ReqWithUser,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.user._id;
    const userData: User = req.body;
    const user = await this.user.findByIdAndUpdate(id, userData, { new: true });
    if (user) {
      res.send(user);
    } else {
      next(new NotFoundException(id, this.path));
    }
  };

  private deleteUser = async (
    req: ReqWithUser,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.user._id;
    const successResponse = await this.user.findByIdAndDelete(id);
    if (successResponse) res.send(200);
    else next(new NotFoundException(id, this.path));
  };
}

export default UserController;
