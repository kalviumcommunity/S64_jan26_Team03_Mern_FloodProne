import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runOptimizedQueries() {

  console.log("🔹 Optimized Query (select only required fields)");
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  console.log(users);

  console.log("🔹 Paginated tasks query (uses index on projectId)");
  const tasks = await prisma.task.findMany({
    where: {
      projectId: 1,   // kisi existing projectId se test karo
    },
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log(tasks);
}

runOptimizedQueries()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
