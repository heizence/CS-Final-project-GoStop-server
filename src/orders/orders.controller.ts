import * as express from 'express';
import Controller from '../interfaces/controller.interface';
import orderModel from './orders.model';
import CreateOrderDto from './order.dto';
import ReqWithUser from '../interfaces/reqWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';
import validationMiddleware from '../middleware/validation.middleware';
import Order from './order.interface';
import NotFoundException from '../exceptions/NotFoundException';

class OrdersController implements Controller {
  public path = '/shop';
  public router = express.Router();
  private order = orderModel;

  constructor() {
    this.initializeRouter();
  }

  private initializeRouter() {
    this.router.get(this.path, this.getAllOrders);
    this.router.get(`${this.path}/:id`, this.getOrderById);
    this.router
      .all(`${this.path}/*`, authMiddleware)
      .patch(
        `${this.path}/:id`,
        validationMiddleware(CreateOrderDto, true),
        this.modifyOrder,
      )
      .delete(`${this.path}/:id`, this.deleteOrder)
      .post(
        this.path,
        authMiddleware,
        validationMiddleware(CreateOrderDto),
        this.createOrder,
      );
  }

  private getAllOrders = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const orders = await this.order
      .find()
      .populate('verifiedId item', '_id name price itemImg');
    res.send(orders);
  };

  private getOrderById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.params.id;
    const order = await this.order
      .findById(id)
      .populate('verifiedId item', '_id');
    if (order) {
      res.send(order);
    } else {
      next(new NotFoundException(id, this.path));
    }
  };

  private modifyOrder = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.params.id;
    const orderData: Order = req.body;
    const order = await this.order.findByIdAndUpdate(id, orderData, {
      new: true,
    });
    if (order) {
      res.send(order);
    } else {
      next(new NotFoundException(id, this.path));
    }
  };

  private deleteOrder = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.params.id;
    const successResponse = this.order.findByIdAndRemove(id);
    if (successResponse) res.status(200).send('OK');
    else next(new NotFoundException(id, this.path));
  };

  private createOrder = async (
    req: ReqWithUser,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const orderData: CreateOrderDto = req.body;
    const createdOrder = new this.order({
      ...orderData,
      verifiedId: req.user._id,
    });
    const savedOrder = await createdOrder.save();
    savedOrder.populate('verifiedId item').execPopulate();
    res.status(201).send('OK');
  };
}

export default OrdersController;
