import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
            return {
                ...p,
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