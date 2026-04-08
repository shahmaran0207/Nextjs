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
            `SELECT SENDER AS "from", RECEPIENT AS "to", CONTENT AS "message", IMAGE AS "imageUrl"
            FROM TEST.CHAT
            WHERE SENDER = :userId OR RECEPIENT = :userId
            ORDER BY ROWID ASC`,
            { userId },
            { outFormat: 4002 }
        );

        const rows = result.rows as any[];

        const data = await Promise.all(rows.map(async (row) => {
            let imageUrl = null;

            if(row.imageUrl) {
                const lob = row.imageUrl;
                const chunks: Buffer[]=[];

                await new Promise((resolve, reject) => {
                    lob.on("data", (chunk: Buffer) => chunks.push(chunk));
                    lob.on("end", resolve);
                    lob.on("error", reject);
                });
                imageUrl = `data:image/jpeg;base64,${Buffer.concat(chunks).toString("base64")}`;
            }
            return {
                from: row.from,
                to: row.to,
                message: row.message,
                imageUrl,
            };
        }));

        if(!result.rows || result.rows.length === 0) {
            return NextResponse.json([], { status: 404 });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("채팅 내역 조회 API 에러::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
        if(conn) await conn.close();
    }
}