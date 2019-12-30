import { Request } from 'express';
import User from '../users/user.interface';

interface ReqWithUser extends Request {
  user: User;
}

export default ReqWithUser;
