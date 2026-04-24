import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, product_id } = await req.json();
    if (!email || !product_id) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const wishlist = await prisma.wishlists.create({
      data: {
        user_id: user.id,
        product_id: Number(product_id),
      }
    });
    return NextResponse.json(wishlist);
  } catch (err: any) {
    if (err.code === 'P2002') return NextResponse.json({ success: true }); // Already exists
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const product_id = searchParams.get("product_id");

    if (!email || !product_id) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await prisma.wishlists.deleteMany({
      where: {
        user_id: user.id,
        product_id: Number(product_id),
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email) return NextResponse.json([]);

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return NextResponse.json([]);

    const wishlists = await prisma.wishlists.findMany({
      where: { user_id: user.id }
    });

    return NextResponse.json(wishlists.map((w: any) => Number(w.product_id)));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
