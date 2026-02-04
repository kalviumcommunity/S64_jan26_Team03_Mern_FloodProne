import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { loginSchema } from "@/lib/schemas";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return sendError(
        "Validation failed",
        ERROR_CODES.VALIDATION_ERROR,
        400,
        result.error.issues.map((e) => ({ field: e.path[0], message: e.message }))
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError("Invalid credentials", ERROR_CODES.AUTH_FAILURE, 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError("Invalid credentials", ERROR_CODES.AUTH_FAILURE, 401);
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

    return sendSuccess(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      "Login successful"
    );
  } catch (error) {
    console.error("Error logging in:", error);
    return sendError(
      "Login failed",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error
    );
  }
}
