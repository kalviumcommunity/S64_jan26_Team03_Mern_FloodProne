import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { locationSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { alerts: true, users: true },
        },
      },
    });
    return sendSuccess(locations, "Locations fetched successfully");
  } catch (error) {
    console.error("Error fetching locations:", error);
    return sendError(
      "Failed to fetch locations",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = locationSchema.safeParse(body);

    if (!result.success) {
      return sendError(
        "Validation failed",
        ERROR_CODES.VALIDATION_ERROR,
        400,
        result.error.issues.map((e) => ({ field: e.path[0], message: e.message }))
      );
    }

    const location = await prisma.location.create({
      data: result.data,
    });

    return sendSuccess(location, "Location created successfully", 201);
  } catch (error: any) {
    if (error.code === "P2002") {
       return sendError(
        "Location with this name already exists",
        ERROR_CODES.VALIDATION_ERROR,
        409
      );
    }
    console.error("Error creating location:", error);
    return sendError(
      "Failed to create location",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      { message: error.message, stack: error.stack }
    );
  }
}
