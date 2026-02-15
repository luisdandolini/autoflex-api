import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/AppError";

export const errorHandler = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction,
): Response => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      status: "error",
      message: error.message,
    });
  }

  if (
    error.message?.includes("duplicate key") ||
    error.message?.includes("unique")
  ) {
    return response.status(409).json({
      status: "error",
      message: "Resource already exists",
    });
  }

  if (error.message?.includes("foreign key")) {
    return response.status(400).json({
      status: "error",
      message: "Referenced resource does not exist",
    });
  }

  console.error("Unexpected error:", error);

  return response.status(500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
  });
};
