import { NextResponse } from "next/server";
import { getConnection } from "@/util/database";

export async function POST(request: Request) {
    const formData = await request.formData();
    const recepientId = formData.get("recepientId") as string;
    const userId = formData.get("userId") as string;
    const message = formData.get("message") as string;

    let conn;
    try{
        conn = await getConnection();
        await conn.execute(
            `INSERT INTO TEST.CHAT(RECEPIENT, SENDER, CONTENT)
            VALUES (:recepientId, :userId, :message)`,
            {
                recepientId, userId, message
            },
            { autoCommit: true}
        );
        return NextResponse.json({ result: "ok"});
    } catch (err: any) {
        console.error("채팅 기록 API 에러::::::", err);
        return NextResponse.json({error: err.message}, {status: 500});
    } finally {
        if (conn) await conn.close();
    }
}