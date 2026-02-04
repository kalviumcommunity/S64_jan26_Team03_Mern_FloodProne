import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect specific routes
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/users")) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ success: false, message: "Token missing" }, { status: 401 });
    }

    try {
      // Verify token using jose (Edge compatible)
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      // Role-based access control
      if (pathname.startsWith("/api/admin") && payload.role !== "ADMIN") {
        return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
      }

      // Attach user info for downstream handlers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", String(payload.id));
      requestHeaders.set("x-user-email", String(payload.email));
      requestHeaders.set("x-user-role", String(payload.role));

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch (error) {
      console.error("Middleware Auth Error:", error);
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*", "/api/users/:path*"],
};
