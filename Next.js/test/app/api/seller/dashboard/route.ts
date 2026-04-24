import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user || user.ROLE !== "SELLER") {
      return NextResponse.json({ error: "Seller not found or unauthorized" }, { status: 404 });
    }

    // 판매자의 상품 조회
    const myProducts = await prisma.products.findMany({
      where: { seller_id: user.id },
      select: { id: true, name: true }
    });

    const productIds = myProducts.map(p => Number(p.id));
    if (productIds.length === 0) {
      return NextResponse.json({ monthlySales: [], productSales: [] });
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // 주문 내역 중 내 상품이 포함된 order_items 조회
    const orderItems = await prisma.order_items.findMany({
      where: {
        product_id: { in: productIds },
        created_at: { gte: sixMonthsAgo },
        item_status: { not: "CANCELLED" }
      }
    });

    // 1. 월별 총 판매 금액
    const monthlyData: Record<string, { month: string; amount: number }> = {};
    
    // 2. 상품별 월별 판매 건수
    const productData: Record<string, any> = {};

    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthStr] = { month: monthStr, amount: 0 };
      productData[monthStr] = { month: monthStr };
      myProducts.forEach(p => {
        productData[monthStr][p.name] = 0;
      });
    }

    orderItems.forEach(item => {
      const d = new Date(item.created_at);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[monthStr]) {
        monthlyData[monthStr].amount += Number(item.total_price);
        
        if (productData[monthStr][item.product_name] !== undefined) {
          productData[monthStr][item.product_name] += Number(item.quantity);
        }
      }
    });

    const monthlySales = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    const productSales = Object.values(productData).sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({
      monthlySales,
      productSales,
      productsList: myProducts.map(p => p.name)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
