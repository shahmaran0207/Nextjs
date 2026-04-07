import { NextResponse } from "next/server";
import { getConnection } from "@/util/database";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params;

    if(!userId) {
        return NextResponse.json({ error: "userId가 없습니다." }, { status: 400 });
    }

    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT SENDER AS "from", RECEPIENT AS "to", CONTENT AS "message"
            FROM TEST.CHAT
            WHERE SENDER = :userId OR RECEPIENT = :userId
            ORDER BY ROWID ASC`,
            { userId },
            { outFormat: 4002 }
        );
console.log("result.rows:::::", result.rows);
console.log("result.metaData:::::", result.metaData);
        if(!result.rows || result.rows.length === 0) {
            return NextResponse.json([], { status: 404 });
        }

        return NextResponse.json(result.rows);
    } catch (err: any) {
        console.error("채팅 내역 조회 API 에러::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
        if(conn) await conn.close();
    }
}