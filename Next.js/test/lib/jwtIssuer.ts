import { generateAccessToken, generateRefreshToken } from "../utils/auth";
import { saveRefreshToken } from "./tokenStore";

/**
 * JWT Token Issuer 서비스
 * 네이버 로그인 성공 후 JWT 토큰을 발급하고 저장합니다.
 */

/**
 * 토큰 발급 파라미터
 */
export interface IssueTokenParams {
    userId: number;
    email: string;
    role: string;
}

/**
 * 토큰 발급 결과
 */
export interface IssueTokenResult {
    accessToken: string;
    refreshToken: string;
}

/**
 * 네이버 로그인 성공 후 JWT 토큰 발급
 * 
 * 요구사항 5.1: 액세스 토큰 생성
 * 요구사항 5.2: 리프레시 토큰 생성
 * 요구사항 5.6: 리프레시 토큰을 데이터베이스에 저장
 * 
 * @param params - 사용자 정보 (userId, email, role)
 * @returns 액세스 토큰 및 리프레시 토큰
 */
export async function issueTokensForNaverLogin(
    params: IssueTokenParams
): Promise<IssueTokenResult> {
    const { userId, email, role } = params;

    // 액세스 토큰 생성 (15분 만료)
    const accessToken = generateAccessToken({
        id: String(userId),
        email,
        ROLE: role,
    });

    // 리프레시 토큰 생성 (7일 만료)
    const refreshToken = generateRefreshToken({
        id: String(userId),
        tokenVersion: 1, // 기본 버전
        ROLE: role,
    });

    // 리프레시 토큰을 데이터베이스에 저장
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일 후
    await saveRefreshToken(String(userId), refreshToken, expiresAt);

    return {
        accessToken,
        refreshToken,
    };
}
