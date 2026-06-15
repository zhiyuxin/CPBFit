import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  if (process.env.POSTGRES_URL) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require("@prisma/adapter-pg") as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      PrismaPg: new (opts: any) => any;
    };
    return new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.POSTGRES_URL }),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3") as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PrismaBetterSqlite3: new (opts: any) => any;
  };
  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" }),
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
