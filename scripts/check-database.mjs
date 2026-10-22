import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
try {
  await prisma.$queryRaw`SELECT 1`;
  console.log("Database connection OK");
} finally {
  await prisma.$disconnect();
}
