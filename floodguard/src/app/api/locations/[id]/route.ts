import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
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
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 },
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
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
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

    return NextResponse.json(location);
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 },
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
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Be careful deleting locations with users/alerts. 
    // Usually we would check or cascade. Prisma might fail if not cascaded properly manually if relation constraints exist.
    // Schema has implicit relations, usually defaults restricts.
    // But let's assume simple delete for now or wrap in try-catch.
    
    await prisma.location.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Location deleted" });
  } catch (error) {
    console.error("Error deleting location:", error);
    return NextResponse.json(
      { error: "Failed to delete location (ensure no related data exists)" },
      { status: 500 },
    );
  }
}
