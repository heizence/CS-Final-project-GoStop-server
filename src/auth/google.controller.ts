import * as express from 'express';
import Controller from '../interfaces/controller.interface';
import userModel from '../users/user.model';
import {
  urlGoogle,
  getGoogleAccountFromCode,
} from '../middleware/google.middleware';
import authCtrl from './authentication.controller';

class GoogleController implements Controller {
  public path = '/auth';
  public router = express.Router();
  private user = userModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/google`, this.getGoogleUrl);
    this.router.get(
      `${this.path}/google/callback`,
      this.getGoogleUserInfo,
      authCtrl.logIn,
    );
  }

  private getGoogleUrl = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const url = await urlGoogle();
    res.redirect(url);
  };

  private getGoogleUserInfo = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const { code } = req.query;
    try {
      const googleUserInfo = await getGoogleAccountFromCode(code);
      console.log('무엇이 들어옵니까? googleUser :: ', googleUserInfo);
      const userEmail = googleUserInfo.email;

      let user = await this.user.findOne({ email: userEmail });
      if (!user) {
        user = await this.user.create({
          name: googleUserInfo.id,
          email: userEmail,
          password: '@googleOauth',
          userCode: 3,
        });
      }
      req.body = user;
      next();
    } catch (error) {
      console.log('gg ctlr :: login failed', error.message);
      res.redirect('/auth/google');
    }
    //req.user = { email: userEmail, password: '@googleOauth' };
    //console.log('넘어가나요? ', req.user);
    //next();
    //res.redirect('/auth/google');
  };
}

export default GoogleController;
