import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Lazily initialize so `next build` doesn't crash if env vars
// are only present at runtime (e.g. Vercel).
const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client: PrismaClient = getClient();
    return (client as unknown as Record<PropertyKey, unknown>)[prop] as unknown;
  },
});

export default prisma;
