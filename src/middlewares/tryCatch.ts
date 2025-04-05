import { RequestHandler } from 'express';

const tryCatchHandler = (
  fn: RequestHandler,
  errorMsg: string,
): RequestHandler => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error: any) {
      console.error('Error in middleware:', error);
      res.status(500).json({ msg: errorMsg, data: error });
    }
  };
};

export default tryCatchHandler;
