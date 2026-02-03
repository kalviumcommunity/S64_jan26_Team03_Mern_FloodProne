This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.





 1. Docker & Docker Compose Setup (Local Development)
🔹 Purpose

To containerize the complete application stack so that every team member can run the same environment locally, eliminating the “it works on my machine” problem.

🔹 Services Used

Next.js App – Frontend & API layer

PostgreSQL – Relational database

Redis – Caching & session support

🔹 Dockerfile (Next.js App)

Uses official Node.js 20 Alpine image

Installs dependencies

Builds the Next.js app

Exposes port 3000

This ensures a lightweight, production-like container for the application.

🔹 docker-compose.yml Overview

The docker-compose.yml file orchestrates all services:

app

Runs the Next.js application

Connected to PostgreSQL & Redis using service names

db

PostgreSQL 15 with persistent volume

redis

Redis 7 lightweight cache

All services communicate via a shared bridge network.

🔹 Volumes & Networking

Volumes ensure database data persists even if containers stop

Docker network allows services to communicate using container names instead of localhost

🔹 Verification

App runs at: http://localhost:3000

PostgreSQL: localhost:5432

Redis: localhost:6379

Verified using:

docker ps

🔹 Reflection

Docker ensures:

Environment consistency

Easy onboarding for new developers

Smooth transition from local to production deployments

🗄️ 2. PostgreSQL Schema Design (Using Prisma ORM)
🔹 Objective

To design a normalized relational database schema that supports scalability, avoids redundancy, and ensures data integrity.

🔹 Core Entities

User – Registered users

Project – Flood-related projects owned by users

Task – Tasks under a project

Comment – Discussion on tasks

TaskStatus – Enum for task progress

🔹 Prisma Schema (Excerpt)
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  projects  Project[]
}

model Project {
  id        Int      @id @default(autoincrement())
  name      String
  createdAt DateTime @default(now())
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks     Task[]

  @@index([userId])
}

🔹 Keys & Constraints

Primary Keys (PK): Auto-incremented IDs

Foreign Keys (FK): Maintain relationships

ON DELETE CASCADE: Ensures cleanup of dependent records

UNIQUE constraint on email

Indexes on frequently queried fields

🔹 Normalization

1NF: Atomic values

2NF: No partial dependency

3NF: No transitive dependency

This design avoids redundancy and ensures data consistency.

🔹 Verification

Tables verified using:

npx prisma studio

🔄 3. Database Migrations & Seed Scripts
🔹 Migration Workflow

Prisma migrations keep the database schema in sync with the Prisma models.

npx prisma migrate dev --name init_schema


This:

Generates SQL migration files

Applies schema changes

Updates Prisma Client

Migration files are stored in:

prisma/migrations/

🔹 Modifying Schema

Whenever the schema changes:

npx prisma migrate dev --name <migration_name>

🔹 Reset / Rollback
npx prisma migrate reset


Drops and recreates the database

Re-applies all migrations

Re-runs seed scripts (optional)

⚠️ Used only in development, never directly in production.

🌱 Seed Script

File: prisma/seed.ts

Purpose:

Insert initial data for testing

Ensure reproducible database state

Example:

await prisma.user.create({
  data: {
    name: "Admin User",
    email: "admin@floodguard.com",
  },
});


Run using:

npx prisma db seed

🔹 Verification

Prisma Studio used to verify seeded data

Ensured seed script is idempotent (no duplicates)

🔹 Reflection (Production Safety)

To protect production data:

Migrations are tested locally & on staging

Database backups are taken before schema changes

Seed scripts are disabled in production

Rollbacks are planned before deployment

 Final Deliverables Checklist

✔ Dockerfile & docker-compose.yml

✔ Normalized Prisma schema

✔ Migration files generated & applied

✔ Seed script executed successfully

✔ Prisma Client connected & verified

✔ Prisma Studio verification

✔ Complete documentation

Conclusion

This setup ensures:

Strong data consistency

Scalable relational design

Safe schema evolution

Team-wide reproducibility