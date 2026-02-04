
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

    const alert = await prisma.alert.findUnique({
      where: { id },
      include: { location: true },
    });

    if (!alert) {
      return sendError("Alert not found", ERROR_CODES.NOT_FOUND, 404);
    }

    return sendSuccess(alert, "Alert fetched successfully");
  } catch (error) {
    console.error("Error fetching alert:", error);
    return sendError(
      "Failed to fetch alert",
      ERROR_CODES.INTERNAL_ERROR,
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

    // Hard delete or Soft delete? Using hard delete for now as per schema
    await prisma.alert.delete({
      where: { id },
    });

    return sendSuccess(null, "Alert deleted successfully");
  } catch (error) {
    console.error("Error deleting alert:", error);
    return sendError(
      "Failed to delete alert",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error
    );
  }
}
