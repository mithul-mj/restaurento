import { ZodError } from "zod";
import { ApiError } from "../utils/errors/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let errorMessage = err.message || "Internal Server Error";
  let errors = err.errors || [];


  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    errors = err.issues.map((error) => ({
      field: error.path.join("."),
      message: error.message,
    }));
    errorMessage = "Input validation failed";
  } else {
    console.error("Critical Server Error:", err);
  }

  const responseBody = {
    success: false,
    message: errorMessage,
  };

  if (errors.length > 0) {
    responseBody.errors = errors;
  }

  return res.status(statusCode).json(responseBody);
};

export default errorHandler;
