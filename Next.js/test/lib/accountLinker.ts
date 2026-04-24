import { prisma } from "@/lib/prisma";

/**
 * 네이버 ID로 사용자 조회
 * @param naverId 네이버 OAuth ID
 * @returns 사용자 레코드 또는 null
 */
export async function findUserByNaverId(naverId: string) {
  try {
    const user = await prisma.users.findFirst({
      where: { naver_id: naverId },
    });
    return user;
  } catch (error) {
    console.error("[FIND_USER_BY_NAVER_ID ERROR]", error);
    throw error;
  }
}

/**
 * 이메일로 사용자 조회
 * @param email 사용자 이메일
 * @returns 사용자 레코드 또는 null
 */
export async function findUserByEmail(email: string) {
  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    console.error("[FIND_USER_BY_EMAIL ERROR]", error);
    throw error;
  }
}

/**
 * 사용자의 naver_id 필드 업데이트
 * @param userId 사용자 ID
 * @param naverId 네이버 OAuth ID
 */
export async function updateNaverId(userId: number, naverId: string) {
  try {
    await prisma.users.update({
      where: { id: userId },
      data: { naver_id: naverId },
    });
  } catch (error) {
    console.error("[UPDATE_NAVER_ID ERROR]", error);
    throw error;
  }
}

/**
 * 이메일 기반 계정 연동 통합 함수
 * 네이버 로그인 시 이메일로 기존 계정을 찾아 naver_id를 업데이트
 * @param naverId 네이버 OAuth ID
 * @param email 네이버 프로필 이메일
 * @returns 연동 결과 (성공 여부, 사용자 ID, 에러 메시지)
 */
export async function linkAccountByEmail(naverId: string, email: string) {
  try {
    // 1. 네이버 ID로 먼저 조회
    const existingUser = await findUserByNaverId(naverId);
    if (existingUser) {
      return {
        success: true,
        userId: existingUser.id,
        user: existingUser,
      };
    }

    // 2. 이메일로 조회
    const userByEmail = await findUserByEmail(email);
    if (!userByEmail) {
      return {
        success: false,
        error: "NO_ACCOUNT",
        message: "연동된 계정이 없습니다. 먼저 일반 회원가입을 진행해주세요",
      };
    }

    // 2.5. 이메일 계정이 이미 다른 네이버 계정과 연동되어 있는지 확인
    if (userByEmail.naver_id && userByEmail.naver_id !== naverId) {
      return {
        success: false,
        error: "ALREADY_LINKED",
        message: "해당 이메일은 이미 다른 네이버 계정과 연동되어 있습니다.",
      };
    }

    // 3. naver_id 업데이트
    await updateNaverId(userByEmail.id, naverId);

    // 4. 업데이트된 사용자 정보 반환
    const updatedUser = await prisma.users.findUnique({
      where: { id: userByEmail.id },
    });

    return {
      success: true,
      userId: userByEmail.id,
      user: updatedUser,
    };
  } catch (error) {
    console.error("[LINK_ACCOUNT_BY_EMAIL ERROR]", error);
    return {
      success: false,
      error: "DB_ERROR",
      message: "계정 연동에 실패했습니다",
    };
  }
}
