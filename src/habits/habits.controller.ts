import * as express from 'express';
import Habit from './habit.interface';
import Controller from '../interfaces/controller.interface';
import habitModel from './habits.model';
import validationMiddleware from '../middleware/validation.middleware';
import CreateHabitDto from './habit.dto';
import NotFoundException from '../exceptions/NotFoundException';
import authMiddleware from '../middleware/auth.middleware';
import ReqWithUser from '../interfaces/reqWithUser.interface';

class HabitsController implements Controller {
  public path = '/habits';
  public router = express.Router();
  private habit = habitModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.getAllHabits);
    this.router.get(`${this.path}/:id`, this.getHabitById);
    this.router
      .all(`${this.path}/*`, authMiddleware)
      .patch(
        `${this.path}/:id`,
        validationMiddleware(CreateHabitDto, true),
        this.modifyHabit,
      )
      .delete(`${this.path}/:id`, this.deleteHabit)
      .post(
        this.path,
        authMiddleware,
        validationMiddleware(CreateHabitDto),
        this.createHabit,
      );
  }

  private getAllHabits = async (
    req: express.Request,
    res: express.Response,
  ) => {
    const habits = await this.habit.find().populate('verifiedId', '-password');
    res.send(habits);
  };

  private getHabitById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.params.id;
    const habit = await this.habit
      .findById(id)
      .populate('verifiedId', '_id name');
    if (habit) res.send(habit);
    else next(new NotFoundException(id, this.path));
  };

  private modifyHabit = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.params.id;
    const habitData: Habit = req.body;
    const habit = await this.habit.findByIdAndUpdate(id, habitData, {
      new: true,
    });

    if (habit) res.send(habit);
    else next(new NotFoundException(id, this.path));
  };

  private deleteHabit = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.params.id;
    const successResponse = await this.habit.findByIdAndDelete(id);

    if (successResponse) res.status(200).send('OK');
    else next(new NotFoundException(id, this.path));
  };

  private createHabit = async (req: ReqWithUser, res: express.Response) => {
    const habitData: CreateHabitDto = req.body;
    const createdHabit = new this.habit({
      ...habitData,
      verifiedId: req.user._id,
    });
    const savedHabit = await createdHabit.save();
    savedHabit.populate('verifiedId').execPopulate();
    res.status(201).send('OK');
  };
}

export default HabitsController;
