import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

// 토큰 페이로드 타입 정의
export interface AccessTokenPayload {
    id: string;
    email: string;
    iat: number;
    exp: number;
}

export interface RefreshTokenPayload {
    id: string;
    tokenVersion: number;
    iat: number;
    exp: number;
}

// ============================================
// 새로운 이중 토큰 시스템 함수
// ============================================

/**
 * 액세스 토큰 생성 (15분 만료)
 * @param user - 사용자 정보 (id, email)
 * @returns JWT 액세스 토큰
 */
export function generateAccessToken(user: { id: string; email: string }): string {
    return jwt.sign(
        { id: user.id, email: user.email },
        SECRET_KEY,
        { expiresIn: "15m" } // 15분
    );
}

/**
 * 리프레시 토큰 생성 (7일 만료)
 * @param user - 사용자 정보 (id, tokenVersion)
 * @returns JWT 리프레시 토큰
 */
export function generateRefreshToken(user: { id: string; tokenVersion: number }): string {
    return jwt.sign(
        { id: user.id, tokenVersion: user.tokenVersion },
        REFRESH_SECRET,
        { expiresIn: "7d" } // 7일
    );
}

/**
 * 액세스 토큰 검증
 * @param token - JWT 액세스 토큰
 * @returns 검증된 페이로드 또는 null
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
        return jwt.verify(token, SECRET_KEY) as AccessTokenPayload;
    } catch (err) {
        return null;
    }
}

/**
 * 리프레시 토큰 검증
 * @param token - JWT 리프레시 토큰
 * @returns 검증된 페이로드 또는 null
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
        return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
    } catch (err) {
        return null;
    }
}

/**
 * 토큰 해싱 (SHA-256) - Web Crypto API 사용
 * @param token - 원본 토큰
 * @returns 해시된 토큰 (hex 형식)
 */
export async function hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
}

// ============================================
// 기존 함수 (하위 호환성 유지)
// ============================================

/**
 * @deprecated 하위 호환성을 위해 유지. generateAccessToken() 사용 권장
 */
export function generateToken(user: { id: string; email: string }): string {
    return generateAccessToken(user);
}

/**
 * @deprecated 하위 호환성을 위해 유지. verifyAccessToken() 사용 권장
 */
export function verifyToken(token: string) {
    return verifyAccessToken(token);
}