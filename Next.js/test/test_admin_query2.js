const { NextResponse } = require('next/server');
const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient();

async function test() {
  try {
    const totalOrders = await prisma.orders.count();
    const totalRevenueResult = await prisma.orders.aggregate({
      _sum: { final_amount: true },
      where: { order_status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } }
    });
    const totalRevenue = totalRevenueResult._sum.final_amount || 0;

    const totalUsers = await prisma.users.count();
    const mapCouponsUsed = await prisma.user_coupons.count({
      where: { is_used: true }
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await prisma.orders.findMany({
      where: {
        order_status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
        ordered_at: { gte: sevenDaysAgo }
      },
      select: {
        final_amount: true,
        ordered_at: true
      }
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueMap = new Map();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      revenueMap.set(days[d.getDay()], { revenue: 0, orders: 0 });
    }

    recentOrders.forEach(order => {
      const dayName = days[order.ordered_at.getDay()];
      if (revenueMap.has(dayName)) {
        const stats = revenueMap.get(dayName);
        stats.revenue += Number(order.final_amount) || 0;
        stats.orders += 1;
      }
    });

    const revenueData = Array.from(revenueMap.entries()).map(([name, stats]) => ({
      name,
      revenue: stats.revenue,
      orders: stats.orders
    }));

    const topProductsRaw = await prisma.order_items.groupBy({
      by: ['product_name'],
      _sum: { quantity: true, total_price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const topProducts = topProductsRaw.map(p => ({
      name: p.product_name,
      sales: Number(p._sum.total_price || 0),
      quantity: Number(p._sum.quantity || 0)
    }));

    const unusedCoupons = await prisma.user_coupons.count({ where: { is_used: false } });

    const couponStats = [
      { name: "미사용 (보관중)", value: unusedCoupons },
      { name: "사용 완료 (할인됨)", value: mapCouponsUsed },
    ];

    console.log("SUCCESS:", {
      kpis: {
        totalOrders,
        totalRevenue: Number(totalRevenue),
        totalUsers,
        mapCouponsUsed
      },
      revenueData,
      topProducts,
      couponStats
    });

  } catch (error) {
    console.error("ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}
test();
