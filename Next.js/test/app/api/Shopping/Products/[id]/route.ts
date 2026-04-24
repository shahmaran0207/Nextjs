import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
            return NextResponse.json({ ...result, rating: avg, reviewCount: reviews.length });
        }

        return NextResponse.json(result);
    } catch (err: any) {
        console.error("getProducts API Error::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 })
    }

}