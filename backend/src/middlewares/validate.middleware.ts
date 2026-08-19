import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../shared/ApiError";
import { StatusCodes } from "../shared/StatusCodes";

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed: any = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        next(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            "Validation Error",
            formattedErrors
          )
        );
      } else {
        next(error);
      }
    }
  };
};
