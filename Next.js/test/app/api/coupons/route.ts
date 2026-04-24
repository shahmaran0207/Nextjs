import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 1. 시스템에 기본 쿠폰이 없으면 생성 (테스트용)
    let welcomeCoupon = await prisma.coupons.findUnique({
      where: { code: "WELCOME_10" }
    });

    if (!welcomeCoupon) {
      welcomeCoupon = await prisma.coupons.create({
        data: {
          code: "WELCOME_10",
          name: "가입 축하 10% 할인 쿠폰",
          discount_type: "PERCENT",
          discount_value: 10,
          min_order_amount: 10000,
          valid_until: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        }
      });
    }

    let flatCoupon = await prisma.coupons.findUnique({
      where: { code: "FLAT_3000" }
    });

    if (!flatCoupon) {
      flatCoupon = await prisma.coupons.create({
        data: {
          code: "FLAT_3000",
          name: "배송비 지원 3,000원 할인 쿠폰",
          discount_type: "AMOUNT",
          discount_value: 3000,
          min_order_amount: 0,
          valid_until: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        }
      });
    }

    // 2. 유저에게 쿠폰 발급 이력이 전혀 없다면 자동 발급 (테스트용)
    const existingUserCoupons = await prisma.user_coupons.count({
      where: { user_id: user.id }
    });

    if (existingUserCoupons === 0) {
      await prisma.user_coupons.createMany({
        data: [
          { user_id: user.id, coupon_id: welcomeCoupon.id },
          { user_id: user.id, coupon_id: flatCoupon.id }
        ]
      });
    }

    // 3. 유저의 "미사용" 쿠폰 목록 조회
    const userCoupons = await prisma.user_coupons.findMany({
      where: {
        user_id: user.id,
        is_used: false,
      }
    });

    // 쿠폰 상세 정보 조인
    const couponIds = userCoupons.map(uc => uc.coupon_id);
    const couponsInfo = await prisma.coupons.findMany({
      where: { id: { in: couponIds } }
    });

    // 만료일 지났는지 필터링
    const now = new Date();
    const validCoupons = userCoupons.map(uc => {
      const info = couponsInfo.find(c => c.id === uc.coupon_id);
      return {
        user_coupon_id: uc.id,
        code: info?.code,
        name: info?.name,
        discount_type: info?.discount_type,
        discount_value: Number(info?.discount_value),
        min_order_amount: Number(info?.min_order_amount),
        valid_until: info?.valid_until
      };
    }).filter(c => c.code && new Date(c.valid_until as Date) > now);

    return NextResponse.json({ coupons: validCoupons });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
