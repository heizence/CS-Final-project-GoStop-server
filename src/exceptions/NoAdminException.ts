import HttpException from './HttpException';

class NoAdminException extends HttpException {
  constructor() {
    super(401, 'Not Allowd Data, Login with amdin info');
  }
}

export default NoAdminException;
