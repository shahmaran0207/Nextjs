import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ethers } from "ethers";

export async function POST(request: Request) {
    try {
        const { account, message, signature, userId } = await request.json();

        if (!account || !message || !signature || !userId) {
            return NextResponse.json({ err: "필수 데이터가 누락되었습니다." }, { status: 400 });
        }

        // 1. 블록체인 서명 검증 (Cryptography 해독)
        const recoveredAddress = ethers.verifyMessage(message, signature);

        // 2. 검증된 주소와 사용자가 주장하는 주소가 일치하는지 확인 (대소문자 무시)
        if (recoveredAddress.toLowerCase() !== account.toLowerCase()) {
            return NextResponse.json({ err: "서명 검증에 실패했습니다. (가짜 서명입니다)" }, { status: 401 });
        }

        // 3. 이미 이 지갑을 연동한 다른 사용자가 있는지 확인
        const existingWallet = await prisma.users.findUnique({
            where: { wallet_address: account.toLowerCase() }
        });

        if (existingWallet && existingWallet.id !== Number(userId)) {
            return NextResponse.json({ err: "이미 다른 계정에 연동된 지갑 주소입니다." }, { status: 409 });
        }

        // 4. 서명 검증이 완료되었으므로, 해당 유저의 DB에 지갑 주소 업데이트
        await prisma.users.update({
            where: { id: Number(userId) },
            data: {
                wallet_address: account.toLowerCase(),
                wallet_verified_at: new Date(),
            }
        });

        return NextResponse.json({ success: true, wallet_address: account.toLowerCase() }, { status: 200 });

    } catch (error) {
        console.error("[WEB3 LINK API ERROR]", error);
        return NextResponse.json({ err: "서버 내부 오류가 발생했습니다." }, { status: 500 });
    }
}
