import { prisma } from "@/lib/prisma";
import { hashToken } from "@/utils/auth";

/**
 * 토큰 저장소 서비스
 * 리프레시 토큰을 데이터베이스에 저장하고 관리합니다.
 */

/**
 * 리프레시 토큰을 데이터베이스에 저장
 * @param userId - 사용자 ID
 * @param token - 원본 리프레시 토큰
 * @param expiresAt - 만료 시간
 */
export async function saveRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date
): Promise<void> {
    const tokenHash = await hashToken(token);

    await prisma.refresh_tokens.create({
        data: {
            user_id: parseInt(userId),
            token_hash: tokenHash,
            expires_at: expiresAt,
        },
    });
}

/**
 * 리프레시 토큰이 데이터베이스에 존재하는지 검증
 * @param userId - 사용자 ID
 * @param token - 원본 리프레시 토큰
 * @returns 토큰이 유효하면 true, 아니면 false
 */
export async function verifyRefreshToken(
    userId: string,
    token: string
): Promise<boolean> {
    const tokenHash = await hashToken(token);

    const storedToken = await prisma.refresh_tokens.findFirst({
        where: {
            user_id: parseInt(userId),
            token_hash: tokenHash,
            expires_at: {
                gt: new Date(), // 만료되지 않은 토큰만
            },
        },
    });

    return storedToken !== null;
}

/**
 * 특정 리프레시 토큰을 데이터베이스에서 삭제
 * @param token - 원본 리프레시 토큰
 */
export async function revokeRefreshToken(token: string): Promise<void> {
    const tokenHash = await hashToken(token);

    await prisma.refresh_tokens.deleteMany({
        where: {
            token_hash: tokenHash,
        },
    });
}

/**
 * 사용자의 모든 리프레시 토큰을 삭제 (보안 위협 시 사용)
 * @param userId - 사용자 ID
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refresh_tokens.deleteMany({
        where: {
            user_id: parseInt(userId),
        },
    });
}

/**
 * 만료된 토큰을 데이터베이스에서 정리
 * @returns 삭제된 토큰 개수
 */
export async function cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.refresh_tokens.deleteMany({
        where: {
            expires_at: {
                lt: new Date(), // 현재 시간보다 이전
            },
        },
    });

    return result.count;
}

/**
 * 토큰 재사용 감지
 * 동일한 토큰이 짧은 시간 내에 여러 번 사용되면 보안 위협으로 판단
 * @param token - 원본 리프레시 토큰
 * @param windowMs - 재사용 감지 시간 윈도우 (기본 5초)
 * @returns 재사용이 감지되면 true
 */
export async function detectTokenReuse(
    token: string,
    windowMs: number = 5000
): Promise<boolean> {
    const tokenHash = await hashToken(token);
    const recentUsageThreshold = new Date(Date.now() - windowMs);

    const recentUsage = await prisma.refresh_tokens.findFirst({
        where: {
            token_hash: tokenHash,
            created_at: {
                gte: recentUsageThreshold,
            },
        },
    });

    return recentUsage !== null;
}
