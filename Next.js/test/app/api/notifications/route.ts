import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/utils/auth";
import { cookies } from "next/headers";

// 알림 목록 조회
export async function GET(req: Request) {
  try {
    let token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value;
    }
    const payload = token ? verifyAccessToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const notifications = await prisma.notifications.findMany({
      where: { user_id: Number(payload.id) },
      orderBy: { created_at: "desc" },
      take: 30,
    });

    return NextResponse.json({ notifications });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 알림 읽음 처리 (body: { id?: number, all?: boolean })
export async function PATCH(req: Request) {
  try {
    let token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value;
    }
    const payload = token ? verifyAccessToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    if (body.all) {
      // 전체 읽음
      await prisma.notifications.updateMany({
        where: { user_id: Number(payload.id), is_read: false },
        data: { is_read: true },
      });
    } else if (body.id) {
      // 개별 읽음
      await prisma.notifications.updateMany({
        where: { id: Number(body.id), user_id: Number(payload.id) },
        data: { is_read: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 알림 생성 (FCM, 배송 완료 등에서 호출)
export async function POST(req: Request) {
  try {
    let token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value;
    }
    const payload = token ? verifyAccessToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, message, link } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    const notification = await prisma.notifications.create({
      data: {
        user_id: Number(payload.id),
        title,
        message,
        link,
      },
    });

    return NextResponse.json({ success: true, notification });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
