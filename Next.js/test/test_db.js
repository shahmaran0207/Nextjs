const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe('ALTER TABLE cart_items DROP CONSTRAINT uq_cart_product;');
  console.log("Constraint dropped!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
