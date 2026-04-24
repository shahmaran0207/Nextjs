import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 최근 6개월 데이터 조회
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const orders = await prisma.orders.findMany({
      where: {
        user_id: user.id,
        ordered_at: { gte: sixMonthsAgo },
        order_status: { not: "CANCELLED" }
      },
      select: {
        ordered_at: true,
        final_amount: true
      }
    });

    // 월별 집계
    const monthlyData: Record<string, { month: string; count: number; amount: number }> = {};

    // 빈 달 초기화
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthStr] = { month: monthStr, count: 0, amount: 0 };
    }

    orders.forEach(order => {
      const d = new Date(order.ordered_at);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[monthStr]) {
        monthlyData[monthStr].count += 1;
        monthlyData[monthStr].amount += Number(order.final_amount);
      }
    });

    // 날짜 오름차순 정렬
    const chartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({ chartData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
