import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { sendSuccess } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";

/**
 * POST /api/users/update
 * Updates user + invalidates users list cache
 */
export async function POST(request: Request) {
  try {
    const { id, name, role, locationId } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(locationId && { locationId }),
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

    // ❗ Invalidate all cached user lists
    const keys = await redis.keys("users:list:*");
    if (keys.length > 0) {
      await redis.del(keys);
      console.log("🧹 Users cache invalidated after update");
    }

    return sendSuccess(updatedUser, "User updated successfully");
  } catch (error) {
    return handleError(error, "POST /api/users/update");
  }
}
