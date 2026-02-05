import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { userSchema } from "@/lib/schemas";
import { handleError } from "@/lib/errorHandler";

/**
 * GET /api/users
 * Cached (paginated)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // 🔑 Pagination-aware cache key
    const cacheKey = `users:list:page=${page}:limit=${limit}`;

    // 1️⃣ Check Redis cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("✅ Users Cache Hit");
      return sendSuccess(
        JSON.parse(cachedData),
        "Users fetched successfully (cache)"
      );
    }

    console.log("❌ Users Cache Miss - Fetching from DB");

    // 2️⃣ Fetch from DB
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          locationId: true,
          location: true,
        },
      }),
      prisma.user.count(),
    ]);

    const responseData = {
      users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    // 3️⃣ Store in Redis (TTL = 60 seconds)
    await redis.set(
      cacheKey,
      JSON.stringify(responseData),
      "EX",
      60
    );

    return sendSuccess(responseData, "Users fetched successfully");
  } catch (error) {
    return handleError(error, "GET /api/users");
  }
}

/**
 * POST /api/users
 * Creates user + invalidates users list cache
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = userSchema.safeParse(body);

    if (!result.success) {
      return sendError(
        "Validation failed",
        ERROR_CODES.VALIDATION_ERROR,
        400,
        result.error.issues.map((e) => ({
          field: e.path[0],
          message: e.message,
        }))
      );
    }

    const { name, email, password, locationId } = result.data;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        locationId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        locationId: true,
      },
    });

    // ❗ Invalidate all paginated users cache
    const keys = await redis.keys("users:list:*");
    if (keys.length > 0) {
      await redis.del(keys);
      console.log("🧹 Users cache invalidated after create");
    }

    return sendSuccess(user, "User created successfully", 201);
  } catch (error) {
    return handleError(error, "POST /api/users");
  }
}
