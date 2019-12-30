import * as express from 'express';

function loggerMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  console.log(`${req.method} ${req.path}`);
  const start = new Date().getTime();
  res.on('finish', () => {
    const elapsed = new Date().getTime() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${elapsed}ms`);
  });
  next();
}

export default loggerMiddleware;
