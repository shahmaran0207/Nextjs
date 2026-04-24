import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/utils/auth";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "";
        const sort = searchParams.get("sort") || "latest"; // latest, price_desc, price_asc, popular

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }
        if (category && category !== "all") {
            where.category = category;
        }

        let orderBy: any = { id: "desc" };
        if (sort === "price_desc") orderBy = { price: "desc" };
        else if (sort === "price_asc") orderBy = { price: "asc" };

        const products = await prisma.products.findMany({
            where,
            orderBy,
        });

        // Get reviews for average rating
        const reviews = await prisma.product_reviews.findMany();

        // Calculate rating per product
        const ratingMap: Record<number, { sum: number; count: number }> = {};
        for (const review of reviews) {
            const pId = Number(review.product_id);
            if (!ratingMap[pId]) ratingMap[pId] = { sum: 0, count: 0 };
            ratingMap[pId].sum += review.rating;
            ratingMap[pId].count += 1;
        }

        const productsWithRating = products.map(p => {
            const r = ratingMap[Number(p.id)];
            
            // 바이너리 데이터 제외 및 플래그 추가
            const has_image = !!(p as any).image_data;
            const { image_data, image_type, ...safeProduct } = p as any;

            return {
                ...safeProduct,
                has_image,
                rating: r ? (r.sum / r.count).toFixed(1) : "0.0",
                reviewCount: r ? r.count : 0
            };
        });

        if (sort === "popular") {
            productsWithRating.sort((a, b) => Number(b.rating) - Number(a.rating));
        }

        return NextResponse.json(productsWithRating);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        let token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token || token === "null") {
            const cookieStore = await cookies();
            token = cookieStore.get("accessToken")?.value;
        }

        const payload = token ? verifyAccessToken(token) : null;
        if (!payload || payload.role !== "SELLER") {
            return NextResponse.json({ error: "판매자만 상품을 등록할 수 있습니다." }, { status: 403 });
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

        let imageData = null;
        let imageType = null;

        if (image) {
            const arrayBuffer = await image.arrayBuffer();
            imageData = Buffer.from(arrayBuffer);
            imageType = image.type;
        }

        const optionsStr = formData.get("options") as string | null;

        const product = await prisma.products.create({
            data: {
                name,
                description: description || "",
                price: Number(price),
                stock: Number(stock),
                category: category || "etc",
                seller_id: Number(payload.id),
                image_data: imageData,
                image_type: imageType,
            }
        });

        if (optionsStr) {
            try {
                const parsedOptions = JSON.parse(optionsStr);
                if (Array.isArray(parsedOptions) && parsedOptions.length > 0) {
                    await prisma.product_options.createMany({
                        data: parsedOptions.map(opt => ({
                            product_id: product.id,
                            option_name: opt.option_name,
                            stock: Number(opt.stock),
                            add_price: Number(opt.add_price) || 0
                        }))
                    });
                }
            } catch (e) {
                console.error("Option parsing error:", e);
            }
        }

        return NextResponse.json({ success: true, productId: Number(product.id) });
    } catch (err: any) {
        console.error("Product Creation Error:", err);
        return NextResponse.json({ error: "상품 등록에 실패했습니다." }, { status: 500 });
    }
}