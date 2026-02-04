
import prisma from "@/lib/prisma";
import { AlertType, Severity } from "@prisma/client";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { alertSchema } from "@/lib/schemas";


export async function GET(request: Request) {
  // ... (GET remains same)
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId");
  const activeOnly = searchParams.get("active") === "true";

  const where: any = {};
  if (locationId) where.locationId = Number(locationId);
  if (activeOnly) where.active = true;

  try {
    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { location: true },
    });
    return sendSuccess(alerts, "Alerts fetched successfully");
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return sendError(
      "Failed to fetch alerts",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = alertSchema.safeParse(body);

    if (!result.success) {
      return sendError(
        "Validation failed",
        ERROR_CODES.VALIDATION_ERROR,
        400,
        result.error.issues.map((e) => ({ field: e.path[0], message: e.message }))
      );
    }

    const alert = await prisma.alert.create({
      data: result.data,
    });

    return sendSuccess(alert, "Alert created successfully", 201);
  } catch (error) {
    console.error("Error creating alert:", error);
    return sendError(
      "Failed to create alert",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error
    );
  }
}
