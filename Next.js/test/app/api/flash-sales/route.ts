import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/utils/auth";
import { cookies } from "next/headers";

// 현재 진행 중인 플래시 세일 목록 조회
export async function GET() {
  try {
    const now = new Date();
    const sales = await prisma.flash_sales.findMany({
      where: {
        is_active: true,
        start_time: { lte: now },
        end_time: { gte: now },
      },
    });
    return NextResponse.json({ sales });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 판매자가 플래시 세일 등록
export async function POST(req: Request) {
  try {
    let token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value;
    }
    const payload = token ? verifyAccessToken(token) : null;
    if (!payload || payload.role !== "SELLER") {
      return NextResponse.json({ error: "판매자만 플래시 세일을 등록할 수 있습니다." }, { status: 403 });
    }

    const { product_id, discount_percent, start_time, end_time } = await req.json();

    if (!product_id || !discount_percent || !start_time || !end_time) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
    }

    // 본인 상품인지 확인
    const product = await prisma.products.findUnique({ where: { id: Number(product_id) } });
    if (!product || Number(product.seller_id) !== Number(payload.id)) {
      return NextResponse.json({ error: "본인의 상품만 세일 등록이 가능합니다." }, { status: 403 });
    }

    // 기존 활성 세일 종료
    await prisma.flash_sales.updateMany({
      where: { product_id: Number(product_id), is_active: true },
      data: { is_active: false },
    });

    const sale = await prisma.flash_sales.create({
      data: {
        product_id: Number(product_id),
        discount_percent: Number(discount_percent),
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        is_active: true,
      },
    });

    return NextResponse.json({ success: true, sale });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 플래시 세일 종료(취소)
export async function DELETE(req: Request) {
  try {
    let token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value;
    }
    const payload = token ? verifyAccessToken(token) : null;
    if (!payload || payload.role !== "SELLER") {
      return NextResponse.json({ error: "판매자만 세일을 종료할 수 있습니다." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const sale_id = searchParams.get("sale_id");

    await prisma.flash_sales.update({
      where: { id: Number(sale_id) },
      data: { is_active: false },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
