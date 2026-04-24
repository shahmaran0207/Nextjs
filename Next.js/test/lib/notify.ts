import { prisma } from "@/lib/prisma";

/**
 * 사용자 알림을 생성하는 헬퍼 함수
 */
export async function createNotification(
  userId: number,
  title: string,
  message: string,
  link?: string
) {
  try {
    await prisma.notifications.create({
      data: {
        user_id: userId,
        title,
        message,
        link: link ?? null,
        is_read: false,
      },
    });
  } catch (err) {
    // 알림 생성 실패는 주 로직에 영향을 주지 않도록 silent
    console.error("Notification create error:", err);
  }
}
