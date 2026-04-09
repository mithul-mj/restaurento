import { ZodError } from "zod";
import { ApiError } from "../utils/errors/ApiError.js";
import STATUS_CODES from "../constants/statusCodes.js";
import { ERROR_MESSAGES } from "../constants/messages.js";

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
  let errorMessage = err.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
  let errors = err.errors || [];


  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = STATUS_CODES.BAD_REQUEST;
    errors = err.issues.map((error) => ({
      field: error.path.join("."),
      message: error.message,
    }));
    errorMessage = ERROR_MESSAGES.VALIDATION_FAILED;
  } else if (err.name === "MulterError") {
    statusCode = STATUS_CODES.BAD_REQUEST;
    errorMessage = `Upload error: ${err.message}`;
    if (err.code === "LIMIT_FILE_SIZE") {
        errorMessage = ERROR_MESSAGES.FILE_TOO_LARGE;
    }
  } else if (err.message && (err.message.includes("Invalid file type") || err.message.includes("allowed type"))) {
    statusCode = STATUS_CODES.BAD_REQUEST;
    errorMessage = ERROR_MESSAGES.INVALID_FILE_TYPE;
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
