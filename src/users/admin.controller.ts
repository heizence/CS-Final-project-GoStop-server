import * as express from 'express';
import adminMiddleware from '../middleware/admin.middleware';
import ReqWithUser from '../interfaces/reqWithUser.interface';
import Controller from '../interfaces/controller.interface';
import userModel from './user.model';
import NotFoundException from '../exceptions/NotFoundException';
import authMiddleware from '../middleware/auth.middleware';

class AdminController implements Controller {
  public path = '/admin';
  public router = express.Router();
  private user = userModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .all(`${this.path}/*`, authMiddleware, adminMiddleware)
      .get(`${this.path}/users`, this.getAllUsers)
      .get(`${this.path}/users/:id`, this.getUserById);
  }

  private getAllUsers = async (
    req: ReqWithUser,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const users = await this.user.find();
    res.send(users);
  };

  private getUserById = async (
    req: ReqWithUser,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.params.id;
    const user = await this.user.findById(id);
    if (user) res.send(user);
    else next(new NotFoundException(id, this.path));
  };
}

export default AdminController;
