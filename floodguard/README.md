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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.---

## API Documentation

FloodGuard provides a set of RESTful API routes under `/api/` for managing locations, users, and alerts.

### **Locations API**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/locations` | List all monitored districts (with summary stats). |
| `POST` | `/api/locations` | Add a new district. |
| `GET` | `/api/locations/:id` | Get details of a specific district (includes active alerts). |
| `PATCH` | `/api/locations/:id` | Update district details (e.g., risk level). |
| `DELETE` | `/api/locations/:id` | Remove a district. |

**Example POST /api/locations:**
```bash
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{"name":"Jaipur","latitude":26.9124,"longitude":75.7873,"riskLevel":"SAFE"}'
```

### **Alerts API**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/alerts?locationId=1` | Get alerts. Filter by `locationId` or `active=true`. |
| `POST` | `/api/alerts` | Create a new alert (System or Admin). |
| `DELETE` | `/api/alerts/:id` | Remove/Resolve an alert. |

**Example POST /api/alerts:**
```bash
curl -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{"type":"HEAVY_RAIN","message":"Heavy rainfall > 50mm","severity":"WARNING","locationId":1}'
```

### **Users API**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users?page=1&limit=10` | List users with pagination. |
| `POST` | `/api/users` | Register a new user. |
| `GET` | `/api/users/:id` | Get user profile. |

### **Weather API**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/weather?lat=...&lon=...` | Fetch current weather and forecast (Source: Open-Meteo). |

---


## Error Handling
The application uses a centralized error handling mechanism to ensure consistent response formatting and secure logging.

### Utilities
- **Logger** (`src/lib/logger.ts`): Structured JSON logger for `info`, `warn`, and `error` levels.
- **Error Handler** (`src/lib/errorHandler.ts`):
  - Catches errors from API routes.
  - Logs detailed stack traces internally (via Logger).
  - Returns a user-friendly message in **Production** (hides stack traces).
  - Returns full error details in **Development** for easier debugging.

### Response Format
All errors follow this JSON structure:
```json
{
  "success": false,
  "message": "Error description",
  "error": { ... }, // Optional details
  "timestamp": "ISO Date"
}
```

## Screenshots

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
🔄 Transaction & Query Optimisation (Prisma ORM)
📌 Overview

This module focuses on ensuring data integrity, atomic operations, and high-performance database queries using Prisma ORM with PostgreSQL.
Transactions are used to prevent partial writes, while indexes and query optimisations are applied to improve performance as the data grows.

1️⃣ Transactions in Prisma
Why Transactions?

A transaction guarantees that multiple related database operations either all succeed or all fail.
This ensures atomicity and consistency.

Use Case in FloodGuard

Create a Project

Create a related Task

If task creation fails, project creation must rollback

Implementation
await prisma.$transaction(async (tx) => {
  const project = await tx.project.create({
    data: {
      name: "Flood Risk Analysis",
      userId: 1,
    },
  });

  // Intentional error to test rollback
  await tx.task.create({
    data: {
      title: null as any, // invalid
      projectId: project.id,
    },
  });
});

✅ Result

Transaction fails

No project or task is saved

Prisma automatically rolls back all operations

2️⃣ Transaction Rollback & Error Handling
Error Handling Strategy

Transactions are wrapped in try-catch blocks to gracefully handle failures.

try {
  await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: { name: "Evacuation Plan", userId: 1 },
    });

    await tx.task.create({
      data: { title: null as any, projectId: project.id },
    });
  });
} catch (error) {
  console.error("Transaction failed. Rolled back successfully.");
}

🔒 Data Safety

No partial records exist in the database

Atomicity is preserved

3️⃣ Query Optimisation Techniques
❌ Over-fetching (Avoided)
await prisma.user.findMany({
  include: { projects: true },
});

✅ Optimised Query
await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});

Batch Inserts

Used createMany() instead of multiple inserts:

await prisma.user.createMany({
  data: [
    { name: "Alice", email: "alice@test.com" },
    { name: "Bob", email: "bob@test.com" },
  ],
});

Pagination
await prisma.task.findMany({
  skip: 0,
  take: 10,
  orderBy: { createdAt: "desc" },
});

4️⃣ Indexes for Performance
Added Indexes in schema.prisma
model Project {
  id     Int @id @default(autoincrement())
  userId Int

  @@index([userId])
}

model Task {
  id        Int @id @default(autoincrement())
  projectId Int

  @@index([projectId])
}

Migration Command
npx prisma migrate dev --name add_indexes

Impact

Faster lookups on foreign key queries

Reduced full table scans

5️⃣ Query Monitoring & Benchmarking
Enable Prisma Query Logs
DEBUG="prisma:query" npx ts-node src/optimizedQueries.ts

Observations

Indexed queries execute faster

Reduced execution time on filtered queries

Cleaner SQL generated by Prisma

Tools Used

Prisma Query Logs

Prisma Studio

6️⃣ Anti-Patterns Avoided

❌ N+1 queries

❌ Over-fetching relational data

❌ Multiple dependent writes without transactions

❌ Full table scans on frequently queried fields

7️⃣ Reflection (Production Readiness)

In production:

Transactions protect against inconsistent writes

Indexes improve scalability

Query logs help monitor slow queries

Performance metrics (latency, error rate) should be tracked

Schema changes should always be tested in staging

✅ Deliverables Completed

✔ Prisma transaction with rollback

✔ Optimised queries implemented

✔ Indexes added to schema

✔ Migration applied successfully

✔ Query logs verified

✔ README documentation completed



## Routes
Public:
- /
- /login

Protected:
- /dashboard
- /users/[id]

## Features
- JWT-based middleware auth
- Dynamic routing
- SEO-friendly URLs
- Custom 404

## Screenshots
- Home
- Login redirect
- Dashboard access
- Dynamic user page
