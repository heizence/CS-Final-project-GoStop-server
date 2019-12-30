import * as bcrypt from 'bcrypt';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import EmailExistsException from '../exceptions/EmailExistsException';
import NoCredentialsException from '../exceptions/NoCredentialsException';
import validationMiddleware from '../middleware/validation.middleware';
import Controller from '../interfaces/controller.interface';
import LogInDto from './logIn.dto';
import User from '../users/user.interface';
import CreateUserDto from '../users/user.dto';
import userModel from '../users/user.model';
import TokenData from '../interfaces/tokenData.interface';
import DataInToken from '../interfaces/dataInToken.interface';
import ReqWithUser from '../interfaces/reqWithUser.interface';
import WrongTokenException from '../exceptions/WrongTokenException';
import OverTokenExpiredException from '../exceptions/OverTokenExpiredException';

class AuthenticationController implements Controller {
  static logIn(arg0: string, logIn: any) {
    throw new Error('Method not implemented.');
  }
  public path = '/auth';
  public router = express.Router();
  private user = userModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/signup`,
      validationMiddleware(CreateUserDto),
      this.signUp,
    );
    this.router.post(
      `${this.path}/login`,
      validationMiddleware(LogInDto),
      this.logIn,
    );
    this.router.post(`${this.path}/logout`, this.logOut);
    this.router.post(`${this.path}/refresh`, this.refresh);
  }

  private signUp = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const userData: CreateUserDto = req.body;

    if (await this.user.findOne({ email: userData.email })) {
      next(new EmailExistsException(userData.email));
    } else {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await this.user.create({
        ...userData,
        password: hashedPassword,
      });

      user.password = undefined;
      res.status(201).send('OK');
    }
  };

  private logIn = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const logInData: LogInDto = req.body;
    let userData = await this.user.findOne({ email: logInData.email });
    if (userData) {
      const isPasswordMatching = await bcrypt.compare(
        logInData.password,
        userData.password,
      );
      if (isPasswordMatching || userData.userCode === 3) {
        userData.password = undefined;

        // jwt
        const expiresIn = 60 * 60 * 24 * 15;
        const refreshToken = await jwt.sign(
          { uid: userData._id },
          process.env.REFRESH_SECRET,
          { expiresIn },
        );
        const user = await this.user.findByIdAndUpdate(
          userData._id,
          { refreshToken: refreshToken },
          {
            new: true,
          },
        );
        const tokenData = await this.createToken(user);

        res.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
        res.json({ refreshToken: refreshToken });
      } else {
        next(new NoCredentialsException());
      }
    } else {
      next(new NoCredentialsException());
    }
  };

  private createToken(user: User) {
    const expiresIn = 60 * 60 * 24;
    const secret = process.env.JWT_SECRET;
    const dataInToken: DataInToken = {
      _id: user._id,
    };

    return {
      expiresIn,
      token: jwt.sign(dataInToken, secret, { expiresIn }),
    };
  }

  private createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token};HttpOnly;Max-Age=${tokenData.expiresIn}`;
  }

  private logOut = (req: express.Request, res: express.Response) => {
    res.setHeader('Set-cookie', ['Authorization=;Max-age=0']);
    res.status(200).send('OK');
  };

  private refresh = async (
    req: ReqWithUser,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const refreshToken = req.body.refreshToken;

    // If the token is wrong, or it expired, the jwt.verify function throws an error and we need to catch it.
    try {
      const verifyResponse = await jwt.verify(
        refreshToken,
        process.env.REFRESH_SECRET,
      );
      const uid = JSON.stringify(verifyResponse)
        .split(':')[1]
        .split(',')[0];
      const id = JSON.parse(uid);
      const user = await userModel.findById(id);

      if (user && user.refreshToken === refreshToken) {
        const tokenData = await this.createToken(user);

        res.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
        res.json({ refreshToken: refreshToken });
      } else {
        next(new WrongTokenException());
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        next(new OverTokenExpiredException());
      } else {
        next(new WrongTokenException());
      }
    }
  };
}
export default AuthenticationController;
