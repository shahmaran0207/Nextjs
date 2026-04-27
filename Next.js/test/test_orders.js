const { PrismaClient } = require('./app/generated/prisma'); 
const prisma = new PrismaClient(); 
async function main() { 
  console.log(await prisma.orders.findMany({ orderBy: { ordered_at: 'desc' }, take: 10 })); 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
