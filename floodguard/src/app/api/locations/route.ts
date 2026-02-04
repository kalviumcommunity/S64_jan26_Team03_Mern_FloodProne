
import prisma from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

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
    const { name, latitude, longitude, riskLevel } = body;

    if (!name || latitude === undefined || longitude === undefined) {
      return sendError(
        "Name, latitude, and longitude are required",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    const location = await prisma.location.create({
      data: {
        name,
        latitude,
        longitude,
        riskLevel,
      },
    });

    return sendSuccess(location, "Location created successfully", 201);
  } catch (error) {
    // Check for unique constraint violation
    if ((error as any).code === "P2002") {
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
      error
    );
  }
}
