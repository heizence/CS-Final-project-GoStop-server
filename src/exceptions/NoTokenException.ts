import HttpException from './HttpException';

class NoTokenException extends HttpException {
  constructor() {
    super(401, 'No Authentication Token');
  }
}

export default NoTokenException;
