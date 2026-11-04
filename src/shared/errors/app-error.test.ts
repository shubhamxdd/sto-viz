import { describe, expect, it } from "vitest";
import {
  AppError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "./app-error";

describe("Application Error Hierarchy", () => {
  it("creates base AppError with default internal server error status", () => {
    const error = new AppError("Something went wrong");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("Something went wrong");
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.name).toBe("AppError");
  });

  it("allows custom status code and error code on base AppError", () => {
    const error = new AppError(
      "Service unavailable",
      503,
      "SERVICE_UNAVAILABLE",
    );

    expect(error.statusCode).toBe(503);
    expect(error.code).toBe("SERVICE_UNAVAILABLE");
  });

  it("creates ValidationError with 400 status code", () => {
    const error = new ValidationError("Invalid stock quantity");

    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("Invalid stock quantity");
  });

  it("creates NotFoundError with 404 status code", () => {
    const error = new NotFoundError("Stock symbol not found");

    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toBe("Stock symbol not found");
  });

  it("creates UnauthorizedError with 401 status code", () => {
    const error = new UnauthorizedError("Authentication required");

    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe("UNAUTHORIZED");
    expect(error.message).toBe("Authentication required");
  });

  it("creates ConflictError with 409 status code", () => {
    const error = new ConflictError("Portfolio name already exists");

    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe("CONFLICT");
    expect(error.message).toBe("Portfolio name already exists");
  });
});
