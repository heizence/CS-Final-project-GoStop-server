import * as express from 'express';
import Todo from './todo.interface';
import Controller from '../interfaces/controller.interface';
import todoModel from './todos.model';
import CreateTodoDto from './todo.dto';
import NotFoundException from '../exceptions/NotFoundException';
import validationMiddleware from '../middleware/validation.middleware';
import authMiddleware from '../middleware/auth.middleware';
import ReqWithUser from '../interfaces/reqWithUser.interface';
import galleryModel from '../galleries/gallerys.model';

class TodosController implements Controller {
  public path = '/todos';
  public router = express.Router();
  private todo = todoModel;
  private gallery = galleryModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.getAllTodos);
    this.router.get(`${this.path}/:id`, this.getTodoById);
    this.router.get(`${this.path}/:id/gallery`, this.getGallery);
    this.router
      .all(`${this.path}/*`, authMiddleware)
      .patch(
        `${this.path}/:id`,
        validationMiddleware(CreateTodoDto, true),
        this.modifyTodo,
      )
      .delete(`${this.path}/:id`, this.deleteTodo)
      .post(
        this.path,
        authMiddleware,
        validationMiddleware(CreateTodoDto),
        this.createTodo,
      );
  }

  private getAllTodos = async (req: express.Request, res: express.Response) => {
    const todos = await this.todo.find().populate('verifiedId', '-password');
    res.send(todos);
  };

  private getTodoById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.params.id;
    const todo = await this.todo
      .findById(id)
      .populate('gallery', 'files')
      .populate('verifiedId', '_id, name');
    if (todo) {
      res.send(todo);
    } else {
      next(new NotFoundException(id, this.path));
    }
  };

  private getGallery = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.params.id;
    const gallery = await this.gallery
      .find({ todos: id })
      .populate('todos', '_id title completed verifiedId');
    if (gallery) {
      res.send(gallery);
    } else {
      next(new NotFoundException(id, this.path));
    }
  };

  private modifyTodo = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.params.id;
    const todoData: Todo = req.body;
    const todo = await this.todo.findByIdAndUpdate(id, todoData, { new: true });
    if (todo) {
      res.send(todo);
    } else {
      next(new NotFoundException(id, this.path));
    }
  };

  private deleteTodo = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const id = req.params.id;
    const successResponse = await this.todo.findByIdAndDelete(id);

    if (successResponse) res.status(200).send('OK');
    else next(new NotFoundException(id, this.path));
  };

  private createTodo = async (req: ReqWithUser, res: express.Response) => {
    const todoData: CreateTodoDto = req.body;
    const createdTodo = new this.todo({
      ...todoData,
      verifiedId: req.user._id,
    });

    const savedTodo = await createdTodo.save();
    savedTodo.populate('verifiedId', '_id, name').execPopulate();
    res.status(201).send('OK');
  };
}

export default TodosController;
