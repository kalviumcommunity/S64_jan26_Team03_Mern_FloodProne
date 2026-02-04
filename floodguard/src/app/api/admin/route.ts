import { NextResponse } from "next/server";
import { sendSuccess } from "@/lib/responseHandler";

export async function GET() {
  return sendSuccess(null, "Welcome Admin! You have full access.", 200);
}
