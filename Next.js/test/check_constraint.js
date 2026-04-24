import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool, { schema: "test" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const constraints = await prisma.$queryRaw`
    SELECT pg_get_constraintdef(c.oid) AS constraint_def
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'payments' AND c.conname = 'payments_payment_method_check';
  `;
  console.log(constraints);
}

main().catch(console.error).finally(() => prisma.$disconnect());
