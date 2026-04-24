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
        if (!payload) {
            return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
        }

        if (payload.role !== "SELLER") {
            return NextResponse.json({ error: "접근 권한이 없습니다." }, { status: 403 });
        }

        const sellerId = Number(payload.id);

        const products = await prisma.products.findMany({
            where: { seller_id: sellerId },
            orderBy: { id: "desc" },
        });

        // Calculate reviews
        const reviews = await prisma.product_reviews.findMany({
            where: { product_id: { in: products.map(p => Number(p.id)) } }
        });

        const ratingMap: Record<number, { sum: number; count: number }> = {};
        for (const review of reviews) {
            const pId = Number(review.product_id);
            if (!ratingMap[pId]) ratingMap[pId] = { sum: 0, count: 0 };
            ratingMap[pId].sum += review.rating;
            ratingMap[pId].count += 1;
        }

        const productsWithInfo = products.map(p => {
            const r = ratingMap[Number(p.id)];
            
            const has_image = !!(p as any).image_data;
            const { image_data, image_type, ...safeProduct } = p as any;

            return {
                ...safeProduct,
                has_image,
                rating: r ? (r.sum / r.count).toFixed(1) : "0.0",
                reviewCount: r ? r.count : 0
            };
        });

        return NextResponse.json(productsWithInfo);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
