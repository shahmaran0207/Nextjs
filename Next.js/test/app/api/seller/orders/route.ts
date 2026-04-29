import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/utils/auth";
import { cookies } from "next/headers";
import { createNotification } from "@/lib/notify";

export async function GET(req: Request) {
    try {
        let token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token || token === "null") {
            const cookieStore = await cookies();
            token = cookieStore.get("accessToken")?.value;
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const status = searchParams.get("status") || "";

        const payload = token ? verifyAccessToken(token) : null;
        if (!payload || payload.role !== "SELLER") {
            return NextResponse.json({ error: "판매자 권한이 없습니다." }, { status: 403 });
        }

        const sellerId = Number(payload.id);

        // 기본값: 최근 1주일
        const now = new Date();
        const defaultStart = new Date();
        defaultStart.setDate(now.getDate() - 7);
        defaultStart.setHours(0, 0, 0, 0);

        const filterStartDate = startDate ? new Date(startDate) : defaultStart;
        const filterEndDate = endDate ? new Date(endDate) : new Date();
        filterEndDate.setHours(23, 59, 59, 999);

        // 판매자가 등록한 상품의 ID 목록 조회 (검색어 필터 포함)
        const myProducts = await prisma.products.findMany({
            where: { 
                seller_id: sellerId,
                ...(search ? { name: { contains: search, mode: "insensitive" } } : {})
            },
            select: { id: true, name: true, category: true, price: true }
        });

        const myProductIds = myProducts.map(p => Number(p.id));

        if (myProductIds.length === 0) {
            return NextResponse.json({ items: [] });
        }

        // 해당 상품들이 포함된 주문 항목(order_items) 조회 (날짜 및 상태 필터 적용)
        const orderItemsWhere: any = {
            product_id: { in: myProductIds },
            created_at: { gte: filterStartDate, lte: filterEndDate }
        };
        if (status) {
            orderItemsWhere.item_status = status;
        }

        const orderItems = await prisma.order_items.findMany({
            where: orderItemsWhere,
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

        // 암호화폐 결제 주문 조회 (날짜 및 상태 매핑 필터 적용)
        const cryptoWhere: any = {
            product_id: { in: myProductIds },
            created_at: { gte: filterStartDate, lte: filterEndDate }
        };

        if (status) {
            if (status === "PENDING") {
                cryptoWhere.status = "pending";
            } else if (status === "PAID") {
                cryptoWhere.OR = [
                    { status: "paid" },
                    { status: "escrow_locked", tracking_number: null }
                ];
            } else if (status === "SHIPPING") {
                cryptoWhere.status = "escrow_locked";
                cryptoWhere.tracking_number = { not: null };
            } else if (status === "DELIVERED") {
                cryptoWhere.status = "released";
            } else {
                cryptoWhere.status = "none_existing_status";
            }
        }

        const cryptoOrdersRaw = await prisma.crypto_payment_orders.findMany({
            where: cryptoWhere,
            orderBy: { created_at: "desc" }
        });

        const cryptoResult = cryptoOrdersRaw.map(co => {
            const prod = myProducts.find(p => Number(p.id) === Number(co.product_id));
            const price = prod ? Number(prod.price) : 0;
            return {
                id: `crypto_${co.id}`,
                order_id: co.order_id,
                product_id: co.product_id,
                product_name: prod?.name || "상품",
                unit_price: price,
                quantity: 1,
                total_price: price,
                crypto_amount: co.amount,
            token_symbol: co.token_symbol,
            tracking_number: co.tracking_number,
            item_status: co.status === "pending" ? "PENDING" 
                       : co.status === "paid" ? "PAID" 
                       : co.status === "escrow_locked" ? (co.tracking_number ? "SHIPPING" : "PAID") 
                       : co.status === "released" ? "DELIVERED" : "PAID",
            created_at: co.created_at,
            order_info: {
                receiver_name: co.receiver_name || "수령인 없음",
                receiver_phone: co.receiver_phone || "-",
                shipping_address: co.shipping_address || "배송지 없음",
                shipping_message: co.shipping_message || ""
            },
            is_crypto: true
            };
        });

        const allItems = [...result, ...cryptoResult].sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // BigInt 직렬화 처리 (Next.js 500 에러 방지)
        const serializedItems = JSON.parse(
            JSON.stringify(allItems, (key, value) =>
                typeof value === "bigint" ? value.toString() : value
            )
        );

        return NextResponse.json({ items: serializedItems });
    } catch (err: any) {
        console.error("Seller Orders Error: ", err);
        return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
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

        const isCrypto = String(order_item_id).startsWith("crypto_");

        if (isCrypto) {
            const cryptoId = Number(String(order_item_id).replace("crypto_", ""));
            const item = await prisma.crypto_payment_orders.findUnique({
                where: { id: cryptoId }
            });
            if (!item) return NextResponse.json({ error: "해당 주문을 찾을 수 없습니다." }, { status: 404 });
            
            const product = await prisma.products.findUnique({
                where: { id: Number(item.product_id) }
            });
            if (!product || product.seller_id !== sellerId) {
                return NextResponse.json({ error: "본인의 상품만 배송 처리할 수 있습니다." }, { status: 403 });
            }

            const updated = await prisma.crypto_payment_orders.update({
                where: { id: cryptoId },
                data: { tracking_number }
            });

            // 구매자에게 알림을 먼저 DB에 저장
            const user = await prisma.users.findUnique({ where: { email: item.buyer_email || "" } });
            if (user) {
                await createNotification(
                    Number(user.id),
                    "상품이 발송되었습니다 🚚",
                    `암호화폐 결제 주문(${item.order_id})의 상품이 출발했습니다. 운송장: ${tracking_number}`,
                    `/orders/${cryptoId}`
                );
            }

            // 그 후 웹소켓으로 실시간 배송 업데이트 알림 전송 (클라이언트가 리로드할 때 DB에 이미 알림이 있도록 보장)
            try {
                await fetch("http://localhost:3001/api/notify-shipping", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId: item.order_id, trackingNumber: tracking_number })
                });
            } catch(e) {
                console.error("WS Notify Error:", e);
            }

            const safeUpdated = JSON.parse(JSON.stringify(updated, (key, value) => 
                typeof value === 'bigint' ? value.toString() : value
            ));
            return NextResponse.json({ success: true, item: safeUpdated });
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

        // 구매자에게 배송 시작 알림 DB 저장
        const order = await prisma.orders.findUnique({
            where: { id: Number(item.order_id) },
            select: { user_id: true, order_number: true }
        });
        if (order) {
            await createNotification(
                Number(order.user_id),
                "상품이 발송되었습니다 🚚",
                `주문(${order.order_number})의 상품이 출발했습니다. 운송장: ${tracking_number}`,
                `/orders/${item.order_id}`
            );
        }

        // 그 후 웹소켓으로 실시간 배송 업데이트 알림 전송
        try {
            await fetch("http://localhost:3001/api/notify-shipping", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: String(item.order_id), trackingNumber: tracking_number })
            });
        } catch(e) {
            console.error("WS Notify Error:", e);
        }

        const safeUpdated = JSON.parse(JSON.stringify(updated, (key, value) => 
            typeof value === 'bigint' ? value.toString() : value
        ));
        return NextResponse.json({ success: true, item: safeUpdated });
    } catch (err: any) {
        console.error("Seller Orders PATCH Error: ", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
