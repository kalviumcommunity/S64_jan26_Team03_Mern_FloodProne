import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AlertType, Severity } from "@prisma/client";

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
    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, message, severity, locationId } = body;

    if (!type || !message || !locationId) {
      return NextResponse.json(
        { error: "Type, message, and locationId are required" },
        { status: 400 },
      );
    }

    // Validate enums
    if (!Object.values(AlertType).includes(type)) {
      return NextResponse.json({ error: "Invalid alert type" }, { status: 400 });
    }
    if (severity && !Object.values(Severity).includes(severity)) {
      return NextResponse.json({ error: "Invalid severity" }, { status: 400 });
    }

    const alert = await prisma.alert.create({
      data: {
        type,
        message,
        severity: severity || Severity.INFO,
        locationId: Number(locationId),
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 },
    );
  }
}
