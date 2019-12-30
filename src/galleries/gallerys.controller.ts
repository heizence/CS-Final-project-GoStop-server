import * as express from 'express';
import Controller from '../interfaces/controller.interface';
import authMiddleware from '../middleware/auth.middleware';
import galleryModel from './gallerys.model';
import NotFoundException from '../exceptions/NotFoundException';
import todoModel from '../todos/todos.model';
import upload from '../middleware/upload.middleware';
import CreateGalleryDto from './gallery.dto';

class GalleriesController implements Controller {
  public path = '/gallery';
  public router = express.Router();
  private gallery = galleryModel;
  private todo = todoModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.getAllImgs);
    this.router.get(`${this.path}/:id`, this.getImgById);
    this.router.post(
      this.path,
      authMiddleware,
      upload.array('files', 3),
      this.createGallery,
    );
  }
  private getAllImgs = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const galleries = await this.gallery.find();
    res.send(galleries);
  };

  private getImgById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.params.id;
    const gallery = await this.gallery.findById(id);
    if (gallery) res.send(gallery);
    else next(new NotFoundException(id, this.path));
  };

  private createGallery = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const galleryData: CreateGalleryDto = req.body;
    const createdGallery = new this.gallery({
      ...galleryData,
      files: req.files,
      todos: [req.body.todos],
    });
    const todo = await this.todo.find({ _id: req.body.todos });

    if (todo.length < 1) {
      next(new NotFoundException(req.body.todos, this.path));
    }

    // gallery.length !== 0 경우 처리하기
    todo[0].gallery = [createdGallery._id];
    await todo[0].save();
    const savedGallery = await createdGallery.save();
    await savedGallery.populate('todo').execPopulate();
    res.send(savedGallery);
  };
}

export default GalleriesController;
