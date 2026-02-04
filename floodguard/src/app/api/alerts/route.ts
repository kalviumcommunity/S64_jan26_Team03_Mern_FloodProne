
import prisma from "@/lib/prisma";
import { AlertType, Severity } from "@prisma/client";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function GET(request: Request) {
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
    const { type, message, severity, locationId } = body;

    if (!type || !message || !locationId) {
      return sendError(
        "Type, message, and locationId are required",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    // Validate enums
    if (!Object.values(AlertType).includes(type)) {
      return sendError("Invalid alert type", ERROR_CODES.VALIDATION_ERROR, 400);
    }
    if (severity && !Object.values(Severity).includes(severity)) {
      return sendError("Invalid severity", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const alert = await prisma.alert.create({
      data: {
        type,
        message,
        severity: severity || Severity.INFO,
        locationId: Number(locationId),
      },
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
