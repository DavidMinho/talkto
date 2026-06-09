import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError, ApiErrorCodes } from "./errors";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(
  code: string,
  message: string,
  status: number,
  details: unknown[] = [],
) {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status },
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return apiError(error.code, error.message, error.status, error.details);
  }

  if (error instanceof ZodError) {
    return apiError(
      ApiErrorCodes.VALIDATION_ERROR,
      "Validation failed",
      400,
      error.issues,
    );
  }

  console.error(error);
  return apiError(
    ApiErrorCodes.INTERNAL_ERROR,
    "Internal server error",
    500,
  );
}
