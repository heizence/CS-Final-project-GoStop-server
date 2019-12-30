import HttpException from './HttpException';

class NotFoundException extends HttpException {
  constructor(id: string, path: string) {
    super(404, `${path} with id ${id} not found`);
  }
}

export default NotFoundException;
