import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/utils/auth";
import { cookies } from "next/headers";
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

        const updatedProduct = await prisma.products.update({
            where: { id: Number(id) },
            data: updateData
        });

        const optionsStr = formData.get("options") as string | null;
        if (optionsStr) {
            try {
                const parsedOptions = JSON.parse(optionsStr);
                
                // 기존 옵션을 모두 inactive 로 처리 (간단한 동기화 방식)
                await prisma.product_options.updateMany({
                    where: { product_id: Number(id) },
                    data: { is_active: false }
                });

                if (Array.isArray(parsedOptions) && parsedOptions.length > 0) {
                    for (const opt of parsedOptions) {
                        // 기존에 같은 이름의 옵션이 있다면 활성화 및 업데이트, 없다면 생성
                        const existingOpt = await prisma.product_options.findFirst({
                            where: { product_id: Number(id), option_name: opt.option_name }
                        });

                        if (existingOpt) {
                            await prisma.product_options.update({
                                where: { id: existingOpt.id },
                                data: {
                                    stock: Number(opt.stock),
                                    add_price: Number(opt.add_price) || 0,
                                    is_active: true
                                }
                            });
                        } else {
                            await prisma.product_options.create({
                                data: {
                                    product_id: Number(id),
                                    option_name: opt.option_name,
                                    stock: Number(opt.stock),
                                    add_price: Number(opt.add_price) || 0,
                                    is_active: true
                                }
                            });
                        }
                    }
                }
            } catch (e) {
                console.error("Option parsing error on update:", e);
            }
        } else {
             // 옵션이 없을 경우 모두 비활성화
             await prisma.product_options.updateMany({
                where: { product_id: Number(id) },
                data: { is_active: false }
            });
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