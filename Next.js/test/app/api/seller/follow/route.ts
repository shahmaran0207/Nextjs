import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/utils/auth";
import { cookies } from "next/headers";
import { createNotification } from "@/lib/notify";

function getAuth(req: Request) {
  return req.headers.get("Authorization")?.split(" ")[1];
}

// 팔로우 여부 확인 + 팔로워 수
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("seller_id");
    if (!sellerId) return NextResponse.json({ error: "seller_id 필요" }, { status: 400 });

    let token = getAuth(req);
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value;
    }
    const payload = token ? verifyAccessToken(token) : null;

    const count = await prisma.seller_follows.count({ where: { seller_id: Number(sellerId) } });

    let isFollowing = false;
    if (payload) {
      const existing = await prisma.seller_follows.findUnique({
        where: { follower_id_seller_id: { follower_id: Number(payload.id), seller_id: Number(sellerId) } },
      });
      isFollowing = !!existing;
    }

    return NextResponse.json({ isFollowing, count });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 팔로우
export async function POST(req: Request) {
  try {
    let token = getAuth(req);
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value;
    }
    const payload = token ? verifyAccessToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { seller_id } = await req.json();
    if (Number(payload.id) === Number(seller_id)) {
      return NextResponse.json({ error: "자기 자신은 팔로우할 수 없습니다." }, { status: 400 });
    }

    await prisma.seller_follows.create({
      data: { follower_id: Number(payload.id), seller_id: Number(seller_id) },
    });

    const count = await prisma.seller_follows.count({ where: { seller_id: Number(seller_id) } });
    return NextResponse.json({ success: true, isFollowing: true, count });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "이미 팔로우 중입니다." }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 언팔로우
export async function DELETE(req: Request) {
  try {
    let token = getAuth(req);
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value;
    }
    const payload = token ? verifyAccessToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const seller_id = searchParams.get("seller_id");

    await prisma.seller_follows.deleteMany({
      where: { follower_id: Number(payload.id), seller_id: Number(seller_id) },
    });

    const count = await prisma.seller_follows.count({ where: { seller_id: Number(seller_id) } });
    return NextResponse.json({ success: true, isFollowing: false, count });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
