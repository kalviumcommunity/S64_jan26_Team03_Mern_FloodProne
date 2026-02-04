
import prisma from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { userUpdateSchema } from "@/lib/schemas";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // ... (GET remains same)
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);

    if (isNaN(id)) {
      return sendError("Invalid ID", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { location: true },
    });

    if (!user) {
      return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    }

    return sendSuccess(user, "User fetched successfully");
  } catch (error) {
    console.error("Error fetching user:", error);
    return sendError(
      "Failed to fetch user",
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

    if (isNaN(id)) {
      return sendError("Invalid ID", ERROR_CODES.VALIDATION_ERROR, 400);
    }
    
    const body = await request.json();
    const result = userUpdateSchema.safeParse(body);

    if (!result.success) {
      return sendError(
        "Validation failed",
        ERROR_CODES.VALIDATION_ERROR,
        400,
        result.error.issues.map((e) => ({ field: e.path[0], message: e.message }))
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: result.data,
    });

    return sendSuccess(user, "User updated successfully");
  } catch (error) {
    console.error("Error updating user:", error);
    return sendError(
      "Failed to update user",
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

    await prisma.user.delete({
      where: { id },
    });

    return sendSuccess(null, "User deleted successfully");
  } catch (error) {
    console.error("Error deleting user:", error);
    return sendError(
      "Failed to delete user",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error
    );
  }
}
