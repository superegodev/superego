import ResponseError from "./ResponseError.js";

/**
 * Extracts as much info as possible from a given an error value (which could be
 * anything in javascript).
 */
export default function extractErrorDetails(error: unknown): any {
  try {
    // Primitive value
    if (
      typeof error === "string" ||
      typeof error === "number" ||
      typeof error === "boolean" ||
      error === null ||
      typeof error === "undefined" ||
      typeof error === "symbol" ||
      typeof error === "bigint" ||
      typeof error === "function"
    ) {
      return String(error);
    }

    // ResponseError
    if (error instanceof ResponseError) {
      return {
        message: error.message,
        name: error.name,
        requestMethod: error.requestMethod,
        requestUrl: error.requestUrl,
        requestBody: error.requestBody,
        responseStatus: error.responseStatus,
        responseBody: error.responseBody,
      };
    }

    // Object value
    if (typeof error === "object") {
      return {
        message: "message" in error ? error.message : undefined,
        name: "name" in error ? error.name : undefined,
        stack: "stack" in error ? error.stack : undefined,
        code: "code" in error ? error.code : undefined,
        signal: "signal" in error ? error.signal : undefined,
        cause: "cause" in error ? extractErrorDetails(error.cause) : undefined,
      };
    }

    return "No detail could be extracted";
  } catch {
    return "Error extracting details from error";
  }
}
