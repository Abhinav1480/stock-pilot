import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  checkRateLimit,
  getClientIp,
} from "@/lib/api-helpers";
import { slugify } from "@/lib/utils";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    if (!checkRateLimit(`register:${ip}`)) {
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    const body = await request.json();

    let data;
    try {
      data = registerSchema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) {
        return validationErrorResponse(err);
      }
      return errorResponse("Invalid request body", 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return errorResponse("An account with this email already exists", 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create organization and user in a transaction
    const slug = slugify(data.organizationName);
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });

    const orgSlug = existingOrg ? `${slug}-${Date.now().toString(36)}` : slug;

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: data.organizationName,
          slug: orgSlug,
        },
      });

      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          hashedPassword,
          role: "OWNER",
          organizationId: organization.id,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: "CREATE",
          entity: "Organization",
          entityId: organization.id,
          userId: user.id,
          organizationId: organization.id,
          metadata: { organizationName: organization.name },
        },
      });

      return { user, organization };
    });

    return successResponse(
      {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug,
        },
      },
      undefined,
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return errorResponse("Internal server error", 500);
  }
}
