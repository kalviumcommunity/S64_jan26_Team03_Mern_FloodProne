import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, url, size, type } = await req.json();

    const file = await prisma.file.create({
      data: {
        name,
        url,
        size,
        type,
      },
    });

    return NextResponse.json({ success: true, file });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "DB insertion failed" },
      { status: 500 }
    );
  }
}
