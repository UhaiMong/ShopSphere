/**
 * Unit Tests — Core Utilities
 * These test pure functions with no DB dependency.
 */

import { ApiError } from "../../src/utils/ApiError";
import {
  getPaginationMeta,
  parsePagination,
} from "../../src/utils/ApiResponse";

// ApiError
describe("ApiError", () => {
  it("creates an error with correct statusCode and message", () => {
    const err = new ApiError(404, "Not found", "NOT_FOUND");
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Not found");
    expect(err.code).toBe("NOT_FOUND");
    expect(err.isOperational).toBe(true);
    expect(err).toBeInstanceOf(Error);
  });

  it(".badRequest() creates a 400 error", () => {
    const err = ApiError.badRequest("Bad input");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
  });

  it(".unauthorized() creates a 401 error", () => {
    const err = ApiError.unauthorized();
    expect(err.statusCode).toBe(401);
  });

  it(".forbidden() creates a 403 error", () => {
    const err = ApiError.forbidden();
    expect(err.statusCode).toBe(403);
  });

  it(".notFound() creates a 404 error with resource name", () => {
    const err = ApiError.notFound("Product");
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain("Product");
  });

  it(".conflict() creates a 409 error", () => {
    const err = ApiError.conflict("Email exists");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("CONFLICT");
  });

  it(".internal() is non-operational", () => {
    const err = ApiError.internal();
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(false);
  });

  it("includes errors array when provided", () => {
    const errors = [{ field: "email", message: "Invalid" }];
    const err = ApiError.badRequest("Validation failed", errors);
    expect(err.errors).toEqual(errors);
  });

  it("has a stack trace", () => {
    const err = new ApiError(500, "Error");
    expect(err.stack).toBeDefined();
  });
});

// getPaginationMeta
describe("getPaginationMeta", () => {
  it("calculates correct totalPages", () => {
    const meta = getPaginationMeta(100, 1, 20);
    expect(meta.totalPages).toBe(5);
  });

  it("rounds up for partial pages", () => {
    const meta = getPaginationMeta(101, 1, 20);
    expect(meta.totalPages).toBe(6);
  });

  it("sets hasNextPage correctly", () => {
    expect(getPaginationMeta(100, 4, 20).hasNextPage).toBe(true);
    expect(getPaginationMeta(100, 5, 20).hasNextPage).toBe(false);
  });

  it("sets hasPrevPage correctly", () => {
    expect(getPaginationMeta(100, 1, 20).hasPrevPage).toBe(false);
    expect(getPaginationMeta(100, 2, 20).hasPrevPage).toBe(true);
  });

  it("handles empty results", () => {
    const meta = getPaginationMeta(0, 1, 20);
    expect(meta.total).toBe(0);
    expect(meta.totalPages).toBe(0);
    expect(meta.hasNextPage).toBe(false);
    expect(meta.hasPrevPage).toBe(false);
  });
});

// parsePagination
describe("parsePagination", () => {
  it("returns defaults for empty query", () => {
    const { page, limit, skip } = parsePagination({});
    expect(page).toBe(1);
    expect(limit).toBe(20);
    expect(skip).toBe(0);
  });

  it("parses page and limit from query", () => {
    const { page, limit, skip } = parsePagination({ page: "3", limit: "10" });
    expect(page).toBe(3);
    expect(limit).toBe(10);
    expect(skip).toBe(20);
  });

  it("clamps page to minimum 1", () => {
    const { page } = parsePagination({ page: "-5" });
    expect(page).toBe(1);
  });

  it("enforces maxLimit", () => {
    const { limit } = parsePagination({ limit: "999" }, 50);
    expect(limit).toBe(50);
  });

  it("clamps limit to minimum 1", () => {
    const { limit } = parsePagination({ limit: "0" });
    expect(limit).toBe(1);
  });

  it("calculates skip correctly for page 2", () => {
    const { skip } = parsePagination({ page: "2", limit: "15" });
    expect(skip).toBe(15);
  });
});
