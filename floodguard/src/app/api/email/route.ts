import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendgrid";
import { welcomeTemplate } from "@/lib/templates/welcome";

export async function POST(req: Request) {
  try {
    const { to, name } = await req.json();

    if (!to || !name) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    await sendEmail(
      to,
      "Welcome to FloodGuard 🚨",
      welcomeTemplate(name)
    );

    console.log("Email sent to:", to);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("SendGrid error:", error.response?.body || error);
    return NextResponse.json(
      { success: false, message: "Email sending failed" },
      { status: 500 }
    );
  }
}
