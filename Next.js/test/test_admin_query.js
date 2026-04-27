const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient();

async function test() {
  try {
    const recentOrders = await prisma.orders.findMany({
      where: {
        order_status: 'PAID',
      },
      select: {
        final_amount: true,
        ordered_at: true
      }
    });
    console.log("recentOrders:", recentOrders.length);

    const topProductsRaw = await prisma.order_items.groupBy({
      by: ['product_name'],
      _sum: { quantity: true, total_price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });
    console.log("topProductsRaw:", topProductsRaw);

  } catch(e) {
    console.error("PRISMA ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
