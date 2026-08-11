import { NextResponse } from "next/server";
import type { ZodError } from "zod";

// Standard response envelope — docs/API Specification.md sections 8-11.
// Every /api/v1 route should use these helpers instead of building JSON by hand,
// so the shape stays consistent for both the web app and the future Flutter client.

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CUSTOMER_NOT_FOUND"
  | "CUSTOMER_HAS_DOCUMENTS"
  | "PRODUCT_NOT_FOUND"
  | "QUOTE_NOT_FOUND"
  | "QUOTE_NOT_DRAFT"
  | "INVOICE_NOT_FOUND"
  | "INVOICE_NOT_DRAFT"
  | "QUOTE_ALREADY_CONVERTED"
  | "QUOTE_NOT_ACCEPTED"
  | "INVOICE_ALREADY_PAID"
  | "INVALID_PAYMENT_AMOUNT"
  | "DUPLICATE_DOCUMENT_NUMBER"
  | "BUSINESS_PROFILE_NOT_FOUND"
  | "RESOURCE_NOT_FOUND"
  | "INVALID_STATUS_TRANSITION"
  | "PDF_GENERATION_FAILED"
  | "INTERNAL_SERVER_ERROR"
  | "RATE_LIMIT_EXCEEDED";

export function apiSuccess<T>(data: T, init?: { status?: number; meta?: Record<string, unknown> }) {
  return NextResponse.json(
    { success: true, data, ...(init?.meta ? { meta: init.meta } : {}) },
    { status: init?.status ?? 200 }
  );
}

export function apiError(code: ApiErrorCode, message: string, status: number) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}

export function apiValidationError(zodError: ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of zodError.issues) {
    const key = issue.path.join(".") || "_root";
    if (!fields[key]) fields[key] = issue.message;
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "VALIDATION_ERROR" as const,
        message: "Please correct the highlighted fields.",
        fields,
      },
    },
    { status: 400 }
  );
}

export const apiUnauthorized = () => apiError("UNAUTHORIZED", "You must be logged in.", 401);

export const apiInternalError = () =>
  apiError("INTERNAL_SERVER_ERROR", "Something went wrong. Please try again.", 500);
