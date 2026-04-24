import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/utils/auth";
import { cookies } from "next/headers";
import { createNotification } from "@/lib/notify";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const result = await prisma.products.findUnique({
            where: { id: Number(id) },
        });

        if (result) {
            const reviews = await prisma.product_reviews.findMany({ where: { product_id: Number(id) } });
            let sum = 0;
            reviews.forEach((r: any) => sum += r.rating);
            const avg = reviews.length > 0 ? (sum / reviews.length).toFixed(1) : "0.0";
            
            const has_image = !!(result as any).image_data;
            const { image_data, image_type, ...safeProduct } = result as any;

            const options = await prisma.product_options.findMany({
                where: { product_id: Number(id), is_active: true }
            });

            return NextResponse.json({ ...safeProduct, has_image, rating: avg, reviewCount: reviews.length, options });
        }

        return NextResponse.json(result);
    } catch (err: any) {
        console.error("getProducts API Error::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 })
    }

}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        let token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token || token === "null") {
            const cookieStore = await cookies();
            token = cookieStore.get("accessToken")?.value;
        }

        const payload = token ? verifyAccessToken(token) : null;
        if (!payload || payload.role !== "SELLER") {
            return NextResponse.json({ error: "판매자만 상품을 수정할 수 있습니다." }, { status: 403 });
        }

        const existingProduct = await prisma.products.findUnique({
            where: { id: Number(id) }
        });

        if (!existingProduct) {
            return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
        }

        if (Number(existingProduct.seller_id) !== Number(payload.id)) {
            return NextResponse.json({ error: "본인이 등록한 상품만 수정할 수 있습니다." }, { status: 403 });
        }

        const formData = await req.formData();
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = formData.get("price") as string;
        const stock = formData.get("stock") as string;
        const category = formData.get("category") as string;
        const image = formData.get("image") as File | null;

        if (!name || !price || !stock) {
            return NextResponse.json({ error: "상품명, 가격, 재고는 필수입니다." }, { status: 400 });
        }

        const updateData: any = {
            name,
            description: description || "",
            price: Number(price),
            stock: Number(stock),
            category: category || "etc"
        };

        if (image) {
            const arrayBuffer = await image.arrayBuffer();
            updateData.image_data = Buffer.from(arrayBuffer);
            updateData.image_type = image.type;
        }

        const oldPrice = Number(existingProduct.price);
        const newPrice = Number(price);

        const updatedProduct = await prisma.products.update({
            where: { id: Number(id) },
            data: updateData
        });

        // 가격 이력 기록
        await prisma.product_price_history.create({
            data: { product_id: Number(id), price: newPrice }
        });

        // 가격 하락 시 위시리스트 + 장바구니 사용자에게 알림
        if (newPrice < oldPrice) {
            const wishlists = await prisma.wishlists.findMany({
                where: { product_id: Number(id) }
            });
            // cart_items → cart_id → carts → user_id 로 별도 조회
            const cartItemsList = await prisma.cart_items.findMany({
                where: { product_id: Number(id) },
                select: { cart_id: true }
            });
            const cartIds = [...new Set(cartItemsList.map(ci => Number(ci.cart_id)))];
            const carts = cartIds.length > 0 ? await prisma.carts.findMany({
                where: { id: { in: cartIds } },
                select: { user_id: true }
            }) : [];

            const allUserIds = new Set<number>();
            for (const w of wishlists) allUserIds.add(Number(w.user_id));
            for (const c of carts) allUserIds.add(Number(c.user_id));

            for (const userId of allUserIds) {
                await createNotification(
                    userId,
                    `가격이 낮아졌어요! 💸`,
                    `위시리스트 상품 "${existingProduct.name}"의 가격이 ${oldPrice.toLocaleString()}원에서 ${newPrice.toLocaleString()}원으로 낮아졌습니다.`,
                    `/Shopping/${id}`
                );
            }
        }

        return NextResponse.json({ success: true, productId: Number(updatedProduct.id) });
    } catch (err: any) {
        console.error("Product Update Error:", err);
        return NextResponse.json({ error: "상품 수정에 실패했습니다." }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        let token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token || token === "null") {
            const cookieStore = await cookies();
            token = cookieStore.get("accessToken")?.value;
        }

        const payload = token ? verifyAccessToken(token) : null;
        if (!payload || payload.role !== "SELLER") {
            return NextResponse.json({ error: "판매자만 상품을 삭제할 수 있습니다." }, { status: 403 });
        }

        const existingProduct = await prisma.products.findUnique({
            where: { id: Number(id) }
        });

        if (!existingProduct) {
            return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
        }

        if (Number(existingProduct.seller_id) !== Number(payload.id)) {
            return NextResponse.json({ error: "본인이 등록한 상품만 삭제할 수 있습니다." }, { status: 403 });
        }

        // Try to hard delete
        try {
            await prisma.products.delete({
                where: { id: Number(id) }
            });
            return NextResponse.json({ success: true, hardDeleted: true });
        } catch (dbErr: any) {
            // Prisma error P2003 = Foreign key constraint failed
            if (dbErr.code === 'P2003') {
                // Soft delete
                await prisma.products.update({
                    where: { id: Number(id) },
                    data: { is_active: false }
                });
                return NextResponse.json({ success: true, softDeleted: true, message: "주문 내역이 존재하여 판매 중지(숨김) 처리되었습니다." });
            }
            throw dbErr;
        }
    } catch (err: any) {
        console.error("Product Delete Error:", err);
        return NextResponse.json({ error: "상품 삭제에 실패했습니다." }, { status: 500 });
    }
}