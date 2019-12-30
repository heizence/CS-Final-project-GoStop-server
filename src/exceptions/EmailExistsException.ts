import HttpException from './HttpException';

class EmailExistsException extends HttpException {
  constructor(email: string) {
    super(400, `User with email ${email} already exists`);
  }
}

export default EmailExistsException;
