import { prisma } from './lib/prisma';

async function main() {
  const p = await prisma.payments.findFirst();
  console.log(p);
}

main().catch(console.error).finally(() => process.exit(0));
