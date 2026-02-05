import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create Location
  const location = await prisma.location.create({
    data: {
      name: "Jaipur",
      latitude: 26.9124,
      longitude: 75.7873,
      riskLevel: "SAFE",
    },
  });

  // Create Admin User
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const user = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@floodguard.com",
      password: hashedPassword,
      role: "ADMIN",
      locationId: location.id,
    },
  });

  console.log("✅ Seeded user:", user.email);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
