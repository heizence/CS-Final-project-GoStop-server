import * as express from 'express';
import ReqWithUser from '../interfaces/reqWithUser.interface';
import NoAdminException from '../exceptions/NoAdminException';

async function adminMiddleware(
  req: ReqWithUser,
  res: express.Response,
  next: express.NextFunction,
) {
  const adminData = req.user;

  if (adminData.userCode === 2) {
    req.user = adminData;
    next();
  } else {
    next(new NoAdminException());
  }
}

export default adminMiddleware;
