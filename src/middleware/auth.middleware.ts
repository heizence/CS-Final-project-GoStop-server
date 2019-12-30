import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import ReqWithUser from '../interfaces/reqWithUser.interface';
import DataInToken from '../interfaces/dataInToken.interface';
import userModel from '../users/user.model';
import WrongTokenException from '../exceptions/WrongTokenException';
import NoTokenException from '../exceptions/NoTokenException';
import OverTokenExpiredException from '../exceptions/OverTokenExpiredException';

async function authMiddleware(
  req: ReqWithUser,
  res: Response,
  next: NextFunction,
) {
  const cookies = req.cookies;

  if (cookies && cookies.Authorization) {
    const secret = process.env.JWT_SECRET;
    // If the token is wrong, or it expired, the jwt.verify function throws an error and we need to catch it.
    try {
      const verifyResponse = (await jwt.verify(
        cookies.Authorization,
        secret,
      )) as DataInToken;
      const id = verifyResponse._id;
      const user = await userModel.findById(id);

      if (user) {
        req.user = user;
        next();
      } else {
        next(new WrongTokenException());
      }
    } catch (error) {
      // console.log('mw catch::', error.message);
      next(new OverTokenExpiredException());
    }
  } else {
    next(new NoTokenException());
  }
}

export default authMiddleware;
