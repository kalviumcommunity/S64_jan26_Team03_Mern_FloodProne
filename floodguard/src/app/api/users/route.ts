import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { userSchema } from "@/lib/schemas";

export async function GET(request: Request) {
  try {
    // Middleware verifies token and sets headers.
    // We can rely on x-user-id header if needed, or just proceed.
    // const userId = request.headers.get("x-user-id");

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
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

export async function POST(request: Request) {
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

    const { name, email, password, locationId } = result.data;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        locationId,
      },
      select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          locationId: true
      }
    });
    
    return sendSuccess(user, "User created successfully", 201);
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
