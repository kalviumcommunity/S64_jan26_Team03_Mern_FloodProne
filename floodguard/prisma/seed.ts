import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@floodguard.com",
      projects: {
        create: {
          name: "Flood Alert System",
          tasks: {
            create: {
              title: "Collect rainfall data",
              status: "TODO",
              comments: {
                create: {
                  content: "Initial task created"
                }
              }
            }
          }
        }
      }
    }
  });

  console.log("Seeded:", user);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
