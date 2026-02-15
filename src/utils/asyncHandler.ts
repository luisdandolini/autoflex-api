import { Request, Response, NextFunction } from "express";

type AsyncFunction = (
  request: Request,
  response: Response,
  next: NextFunction,
) => Promise<any>;

export const asyncHandler = (fn: AsyncFunction) => {
  return (request: Request, response: Response, next: NextFunction) => {
    Promise.resolve(fn(request, response, next)).catch(next);
  };
};
