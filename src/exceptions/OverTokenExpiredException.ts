import HttpException from './HttpException';

class OverTokenExpiredException extends HttpException {
  constructor() {
    super(401, `TokenExpiredError: jwt expired`);
  }
}

export default OverTokenExpiredException;
