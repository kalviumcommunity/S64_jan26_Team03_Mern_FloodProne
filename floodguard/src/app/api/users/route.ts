import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { userSchema } from "@/lib/schemas";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function GET(request: Request) {
  try {
    // 1. Check for Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return sendError("Token missing", ERROR_CODES.AUTH_FAILURE, 401);
    }

    // 2. Verify Token
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return sendError("Invalid or expired token", ERROR_CODES.AUTH_FAILURE, 403);
    }

    // 3. Proceed with request logic
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        include: { location: true },
        orderBy: { createdAt: "desc" },
        select: { // Exclude password from list
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          locationId: true,
          location: true
        }
      }),
      prisma.user.count(),
    ]);

    return sendSuccess(
      {
        users,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Users fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return sendError(
      "Failed to fetch users",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error
    );
  }
}

// POST and PATCH remain the same (validation is already handled there)
export async function POST(request: Request) {
// ... (previous POST implementation, no changes needed for this task unless we want to protect creation too, but usually signup is public or admin-only. User creation via /api/users might be admin feature, while /api/auth/signup is public. For now, we leave POST as is but ensure schema is used)
  try {
    const body = await request.json();
    const result = userSchema.safeParse(body);

    if (!result.success) {
      return sendError(
        "Validation failed",
        ERROR_CODES.VALIDATION_ERROR,
        400,
        result.error.issues.map((e) => ({ field: e.path[0], message: e.message }))
      );
    }

    // Hash password here if we are creating user via this route too
    // Ideally /api/users POST should also hash password if it accepts one
    // But currently userSchema includes password, so we need to hash it.
    // Wait, the previous POST implementation didn't hash password because it wasn't in schema yet.
    // Now it is in schema.
    
    // Let's rely on /api/auth/signup for public signup.
    // If we keep this POST endpoint operational for admins, we should hash password.
    
    const { name, email, password, locationId } = result.data;
    
    // START: Consistency update - Hash password for this route too
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);
    // END: Consistency update

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        locationId,
      },
    });
    
    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;

    return sendSuccess(userWithoutPassword, "User created successfully", 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return sendError(
      "Failed to create user",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error
    );
  }
}
