import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { getConnection } from "@/util/database";
import oracledb from "oracledb";

export async function POST(request: NextRequest) {
    const session = await auth();
    const { name } = await request.json();

    const naverId = (session?.user as any)?.naverid;
    if (!naverId) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const conn = await getConnection();

    // 이름 중복 체크
    const dupCheck = await conn.execute(
        `SELECT 1 FROM TEST.USERS WHERE NAME = :name`,
        { name },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if ((dupCheck.rows as any[]).length > 0) {
        await conn.close();
        return NextResponse.json({ error: "이미 사용 중인 닉네임" }, { status: 409 });
    }

    await conn.execute(
        `INSERT INTO TEST.USERS (NAVER_ID, NAME) VALUES (:naverId, :name)`,
        { naverId, name },
        { autoCommit: true }
    );
    await conn.close();

    return NextResponse.json({ ok: true });
}
