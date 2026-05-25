import 'dotenv/config';
import { defineConfig } from "@prisma/config";

// Prioritize DIRECT_URL (direct database connection bypasses PgBouncer) for Prisma CLI migrations & pushes 
// to prevent hanging/indefinite timeouts on connection pools.
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
