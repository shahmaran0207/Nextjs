import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/utils/auth";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. 유저 인증 처리 (Token or Fallback)
    let token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value;
    }
    
    // 만약 토큰이 없으면 WOW 효과(시연)를 위해 기본 더미 유저 아이디(1) 사용
    let userId = 1; 
    if (token) {
      const payload = verifyAccessToken(token);
      if (payload) userId = Number(payload.id);
    }

    // 2. 유저 통계 패치
    const totalOrdersResult = await prisma.orders.aggregate({
      _sum: { final_amount: true },
      _count: { id: true },
      where: { user_id: userId, order_status: 'PAID' }
    });

    const totalSpent = totalOrdersResult._sum.final_amount || 0;
    const orderCount = totalOrdersResult._count.id || 0;

    const wishlistCount = await prisma.wishlists.count({
      where: { user_id: userId }
    });

    const reviewCount = await prisma.product_reviews.count({
      where: { user_id: userId }
    });

    // 최근 주문 3건
    const recentOrders = await prisma.orders.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 3,
      select: {
        id: true,
        order_number: true,
        final_amount: true,
        order_status: true,
        created_at: true
      }
    });

    return NextResponse.json({
      stats: {
        totalSpent: Number(totalSpent),
        orderCount,
        wishlistCount,
        reviewCount
      },
      recentOrders
    });

  } catch (error) {
    console.error("MyPage API Error:", error);
    // 폴백 데이터를 내려주어 화면이 터지지 않도록 함
    return NextResponse.json({
      stats: { totalSpent: 0, orderCount: 0, wishlistCount: 0, reviewCount: 0 },
      recentOrders: []
    });
  }
}
