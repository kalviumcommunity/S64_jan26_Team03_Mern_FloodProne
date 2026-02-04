
import prisma from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);

    if (isNaN(id)) {
      return sendError("Invalid ID", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        alerts: {
          where: { active: true },
        },
        weatherLogs: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!location) {
      return sendError("Location not found", ERROR_CODES.NOT_FOUND, 404);
    }

    return sendSuccess(location, "Location fetched successfully");
  } catch (error) {
    console.error("Error fetching location:", error);
    return sendError(
      "Failed to fetch location",
      ERROR_CODES.INTERNAL_ERROR,
      500,
      error
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    const body = await request.json();
    const { name, latitude, longitude, riskLevel } = body;

    if (isNaN(id)) {
      return sendError("Invalid ID", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const location = await prisma.location.update({
      where: { id },
      data: {
        name,
        latitude,
        longitude,
        riskLevel,
      },
    });

    return sendSuccess(location, "Location updated successfully");
  } catch (error) {
    console.error("Error updating location:", error);
    return sendError(
      "Failed to update location",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);

    if (isNaN(id)) {
      return sendError("Invalid ID", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    await prisma.location.delete({
      where: { id },
    });

    return sendSuccess(null, "Location deleted successfully");
  } catch (error) {
    console.error("Error deleting location:", error);
    return sendError(
      "Failed to delete location",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error
    );
  }
}
