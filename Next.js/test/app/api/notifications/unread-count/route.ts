import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/utils/auth";
import { cookies } from "next/headers";

// 읽지 않은 알림 개수만 반환 (헤더 뱃지용)
export async function GET(req: Request) {
  try {
    let token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value;
    }
    const payload = token ? verifyAccessToken(token) : null;
    if (!payload) return NextResponse.json({ count: 0 });

    const count = await prisma.notifications.count({
      where: { user_id: Number(payload.id), is_read: false },
    });

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
