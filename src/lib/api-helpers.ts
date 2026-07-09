import { type NextRequest, NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function successResponse<T>(
  data: T,
  meta?: ApiResponse["meta"],
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, meta }, { status });
}

export function errorResponse(
  error: string,
  status = 400,
  errors?: Record<string, string[]>
): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error, errors }, { status });
}

export function validationErrorResponse(
  error: ZodError
): NextResponse<ApiResponse> {
  const errors: Record<string, string[]> = {};
  error.issues.forEach((err) => {
    const path = err.path.join(".");
    if (!errors[path]) errors[path] = [];
    errors[path].push(err.message);
  });
  return NextResponse.json(
    { success: false, error: "Validation failed", errors },
    { status: 422 }
  );
}

export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse<ApiResponse> }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data };
  } catch (err) {
    if (err instanceof ZodError) {
      return { error: validationErrorResponse(err) };
    }
    return { error: errorResponse("Invalid request body", 400) };
  }
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
  const search = searchParams.get("search") ?? undefined;
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";

  return { page, limit, search, sortBy, sortOrder, skip: (page - 1) * limit };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): ApiResponse["meta"] {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

// Rate limiting - simple in-memory token bucket
const rateLimitMap = new Map<string, { tokens: number; lastRefill: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const MAX_TOKENS = 60; // 60 requests per minute

export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry) {
    rateLimitMap.set(identifier, { tokens: MAX_TOKENS - 1, lastRefill: now });
    return true;
  }

  const elapsed = now - entry.lastRefill;
  if (elapsed > RATE_LIMIT_WINDOW) {
    entry.tokens = MAX_TOKENS - 1;
    entry.lastRefill = now;
    return true;
  }

  if (entry.tokens <= 0) {
    return false;
  }

  entry.tokens--;
  return true;
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
