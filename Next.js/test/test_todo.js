const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  try {
    const todos = await prisma.todos.findMany({
      take: 1
    });
    console.log("Todos fetch test successful", todos);
  } catch (error) {
    console.error("Error fetching todos", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
