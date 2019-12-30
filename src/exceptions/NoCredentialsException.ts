import HttpException from './HttpException';

class NoCredentialsException extends HttpException {
  constructor() {
    super(401, 'Wrong Credentials provied');
  }
}

export default NoCredentialsException;
