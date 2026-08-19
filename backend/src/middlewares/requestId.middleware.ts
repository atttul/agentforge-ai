import { Request, Response, NextFunction } from "express";

export const requestIdMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    req.requestId = crypto.randomUUID();
  
    res.setHeader("X-Request-Id", req.requestId);
  
    next();
  };