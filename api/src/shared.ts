import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: { code: string; message: string; details?: unknown } | null;
};

export function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, error: null };
}

export function fail(code: string, message: string, details?: unknown): ApiResponse<never> {
  return { success: false, data: null, error: { code, message, details } };
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export function validate<T>(schema: ZodSchema<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid request payload", error.flatten());
    }
    throw error;
  }
}

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== "test") {
    console.log(`${req.method} ${req.originalUrl}`);
  }
  next();
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response<ApiResponse<never>>,
  _next: NextFunction
) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json(fail(error.code, error.message, error.details));
    return;
  }

  console.error(error);
  res.status(500).json(fail("INTERNAL_ERROR", "Unexpected server error"));
}
