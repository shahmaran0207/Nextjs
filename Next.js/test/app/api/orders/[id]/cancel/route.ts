import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { email } = body;

    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 1. 주문 정보 및 결제 정보 조회
    const order = await prisma.orders.findUnique({
      where: { id: Number(id) }
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // 권한 확인 (구매자 본인이거나 관리자)
    if (Number(order.user_id) !== Number(user.id) && user.ROLE !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 이미 취소된 주문인지 확인
    if (order.order_status === "CANCELLED") {
      return NextResponse.json({ error: "Already cancelled" }, { status: 400 });
    }

    const payment = await prisma.payments.findFirst({
      where: { order_id: Number(id), payment_status: "DONE" }
    });

    if (!payment || !payment.payment_key) {
      return NextResponse.json({ error: "Payment information not found" }, { status: 404 });
    }

    // 2. 포트원 토큰 발급
    const PORTONE_API_KEY = process.env.PORTONE_API_KEY;
    const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET;

    if (!PORTONE_API_KEY || !PORTONE_API_SECRET) {
      return NextResponse.json({ error: "서버 결제 설정 오류 (API 키 누락)" }, { status: 500 });
    }

    const tokenRes = await axios.post("https://api.iamport.kr/users/getToken", {
      imp_key: PORTONE_API_KEY,
      imp_secret: PORTONE_API_SECRET
    });

    const { access_token } = tokenRes.data.response;

    // 3. 결제 취소 요청
    const cancelRes = await axios.post("https://api.iamport.kr/payments/cancel", {
      imp_uid: payment.payment_key,
      merchant_uid: order.order_number,
      reason: "고객 요청에 의한 환불"
    }, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (cancelRes.data.code !== 0) {
      return NextResponse.json({ error: `포트원 취소 실패: ${cancelRes.data.message}` }, { status: 400 });
    }

    // 4. DB 상태 업데이트 (트랜잭션)
    await prisma.$transaction(async (tx) => {
      // 주문 상태 변경
      await tx.orders.update({
        where: { id: Number(id) },
        data: { order_status: "CANCELLED" }
      });

      // 결제 상태 변경
      await tx.payments.update({
        where: { id: Number(payment.id) },
        data: {
          payment_status: "CANCELLED",
          cancelled_at: new Date()
        }
      });

      // 재고 복구 로직
      const orderItems = await tx.order_items.findMany({
        where: { order_id: Number(id) }
      });

      for (const item of orderItems) {
        if (item.option_name) {
          await tx.product_options.updateMany({
            where: { product_id: item.product_id, option_name: item.option_name },
            data: { stock: { increment: item.quantity } }
          });
        } else {
          await tx.products.update({
            where: { id: item.product_id },
            data: { stock: { increment: item.quantity } }
          });
        }
      }

      // 포인트 환불 (사용한 포인트가 있다면)
      if (order.discount_amount && Number(order.discount_amount) > 0) {
        await tx.users.update({
          where: { id: Number(order.user_id) },
          data: { points: { increment: order.discount_amount } }
        });
        await tx.point_logs.create({
          data: {
            user_id: Number(order.user_id),
            amount: order.discount_amount,
            description: `주문(${order.order_number}) 취소 환불 포인트`
          }
        });
      }

      // 회수한 적립금 (최종 결제 금액의 1%) 다시 차감
      const earnedPoints = Math.floor(Number(order.final_amount) * 0.01);
      if (earnedPoints > 0) {
        await tx.users.update({
          where: { id: Number(order.user_id) },
          data: { points: { decrement: earnedPoints } }
        });
        await tx.point_logs.create({
          data: {
            user_id: Number(order.user_id),
            amount: -earnedPoints,
            description: `주문(${order.order_number}) 취소로 인한 적립금 회수`
          }
        });
      }
    });

    return NextResponse.json({ success: true, message: "결제가 성공적으로 취소되었습니다." });
  } catch (err: any) {
    console.error("Cancel Error:", err.response?.data || err.message);
    return NextResponse.json({ error: "취소 처리 중 서버 오류가 발생했습니다." }, { status: 500 });
  }
}
