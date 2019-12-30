import * as express from 'express';
import Controller from '../interfaces/controller.interface';
import itemModel from './items.models';
import CreateItemDto from './item.dto';
import NotFoundException from '../exceptions/NotFoundException';
import Item from './item.interface';
import upload from '../middleware/upload.middleware';
import authMiddleware from '../middleware/auth.middleware';
import validationMiddleware from '../middleware/validation.middleware';
import adminMiddleware from '../middleware/admin.middleware';

class ItemsController implements Controller {
  public path = '/items';
  public router = express.Router();
  private item = itemModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.getAllItems);
    this.router.get(`${this.path}/:id`, this.getItemById);
    this.router
      .all(`${this.path}/*`, authMiddleware, adminMiddleware)
      .patch(
        `${this.path}/:id`,
        validationMiddleware(CreateItemDto, true),
        this.modifyItem,
      )
      .delete(`${this.path}/:id`, this.deleteItem)
      .post(this.path, authMiddleware, this.createItem);
  }

  private getAllItems = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const items = await this.item.find();
    res.send(items);
  };

  private getItemById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.params.id;
    const item = await this.item.findById(id);
    if (item) {
      res.send(item);
    } else {
      next(new NotFoundException(id, this.path));
    }
  };

  private modifyItem = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const itemData: Item = req.body;
    const id = req.params.id;
    const item = await this.item.findByIdAndUpdate(
      id,
      //{ ...itemData, itemImg: req.file },
      itemData,
      { new: true },
    );
    if (item) {
      res.send(item);
    } else {
      next(new NotFoundException(id, this.path));
    }
  };

  private deleteItem = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.params.id;
    const successResponse = await this.item.findByIdAndDelete(id);

    if (successResponse) res.status(200).send('OK');
    else next(new NotFoundException(id, this.path));
  };

  private createItem = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const itemData: CreateItemDto = req.body;
    const createdItem = new this.item(itemData);
    const savedItem = await createdItem.save();
    res.status(201).send('OK');
  };
}

export default ItemsController;
