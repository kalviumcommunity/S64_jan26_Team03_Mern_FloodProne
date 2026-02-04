import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { userSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(
        "User already exists",
        ERROR_CODES.VALIDATION_ERROR,
        409
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword,
        locationId 
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return sendSuccess(userWithoutPassword, "Signup successful", 201);
  } catch (error) {
    console.error("Error signing up:", error);
    return sendError(
      "Signup failed",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error
    );
  }
}
