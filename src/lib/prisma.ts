import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function isPostgresUrl(url: string | undefined): url is string {
  return !!url && /^postgres(?:ql)?:\/\//.test(url);
}

function createPrismaClient(): PrismaClient {
  const postgresUrl = process.env.POSTGRES_URL ??
    (isPostgresUrl(process.env.DATABASE_URL) ? process.env.DATABASE_URL : undefined);

  if (postgresUrl) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require("@prisma/adapter-pg") as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      PrismaPg: new (opts: any) => any;
    };
    return new PrismaClient({
      adapter: new PrismaPg({ connectionString: postgresUrl }),
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
