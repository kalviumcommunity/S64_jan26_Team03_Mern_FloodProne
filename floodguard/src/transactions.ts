import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runTransaction() {
  try {
    await prisma.$transaction(async (tx) => {

      // 1️⃣ Create Project
      const project = await tx.project.create({
        data: {
          name: "Flood Alert System",
        },
      });

      console.log("Project created:", project.id);

      // 2️⃣ Create Task (INTENTIONAL ERROR)
      await tx.task.create({
        data: {
          title: null as any,   // ❌ intentional error
          projectId: project.id,
        },
      });

      // ❗ ye line kabhi execute nahi hogi
      console.log("This will not run");
    });

  } catch (error) {
    console.error("❌ Transaction failed. Rolled back!");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

runTransaction();
