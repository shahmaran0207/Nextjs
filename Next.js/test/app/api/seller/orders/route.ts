import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/utils/auth";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    try {
        let token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token || token === "null") {
            const cookieStore = await cookies();
            token = cookieStore.get("accessToken")?.value;
        }

        const payload = token ? verifyAccessToken(token) : null;
        if (!payload || payload.role !== "SELLER") {
            return NextResponse.json({ error: "판매자 권한이 없습니다." }, { status: 403 });
        }

        const sellerId = Number(payload.id);

        // 판매자가 등록한 상품의 ID 목록 조회
        const myProducts = await prisma.products.findMany({
            where: { seller_id: sellerId },
            select: { id: true, name: true, category: true }
        });

        const myProductIds = myProducts.map(p => Number(p.id));

        if (myProductIds.length === 0) {
            return NextResponse.json({ items: [] });
        }

        // 해당 상품들이 포함된 주문 항목(order_items) 조회
        const orderItems = await prisma.order_items.findMany({
            where: { product_id: { in: myProductIds } },
            orderBy: { created_at: "desc" }
        });

        // 주문 항목에 해당하는 원본 주문(orders) 정보 조회 (구매자 정보, 주소 등)
        const orderIds = Array.from(new Set(orderItems.map(item => Number(item.order_id))));
        const orders = await prisma.orders.findMany({
            where: { id: { in: orderIds } }
        });

        const orderMap = new Map();
        orders.forEach(o => orderMap.set(Number(o.id), o));

        const result = orderItems.map(item => ({
            ...item,
            order_info: orderMap.get(Number(item.order_id)),
            product_info: myProducts.find(p => Number(p.id) === Number(item.product_id))
        }));

        return NextResponse.json({ items: result });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        let token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token || token === "null") {
            const cookieStore = await cookies();
            token = cookieStore.get("accessToken")?.value;
        }

        const payload = token ? verifyAccessToken(token) : null;
        if (!payload || payload.role !== "SELLER") {
            return NextResponse.json({ error: "판매자 권한이 없습니다." }, { status: 403 });
        }

        const sellerId = Number(payload.id);
        const { order_item_id, tracking_number } = await req.json();

        if (!order_item_id || !tracking_number) {
            return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
        }

        // 해당 order_item 확인
        const item = await prisma.order_items.findUnique({
            where: { id: Number(order_item_id) }
        });

        if (!item) {
            return NextResponse.json({ error: "해당 주문 항목을 찾을 수 없습니다." }, { status: 404 });
        }

        // 내 상품인지 권한 확인
        const product = await prisma.products.findUnique({
            where: { id: Number(item.product_id) }
        });

        if (!product || product.seller_id !== sellerId) {
            return NextResponse.json({ error: "본인의 상품만 배송 처리할 수 있습니다." }, { status: 403 });
        }

        // 업데이트 수행
        const updated = await prisma.order_items.update({
            where: { id: Number(order_item_id) },
            data: {
                tracking_number,
                item_status: "SHIPPING"
            }
        });

        // 상위 주문 상태도 SHIPPED로 업데이트
        await prisma.orders.update({
            where: { id: Number(item.order_id) },
            data: { order_status: "SHIPPED" }
        });

        return NextResponse.json({ success: true, item: updated });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
