import { NextResponse } from "next/server";
import { getConnection } from "@/util/database";
import oracledb from "oracledb"; 

export async function POST(request: Request) {
    const formData = await request.formData();
    const recepientId = formData.get("recepientId") as string;
    const userId = formData.get("userId") as string;
    const message = formData.get("message") as string;
    const image = formData.get("image") as File;
    const iamgeBuffer = image ? Buffer.from(await image.arrayBuffer()): null;
    const imageUrl = iamgeBuffer ? `data:image/jpeg;base64,${iamgeBuffer.toString("base64")}`:null;

    let conn;
    try{
        conn = await getConnection();
        await conn.execute(
            `INSERT INTO TEST.CHAT(RECEPIENT, SENDER, CONTENT, IMAGE)
            VALUES (:recepientId, :userId, :message, :image)`,
            {
                recepientId, userId, message, 
                image: { val: iamgeBuffer, type: oracledb.BLOB}
            },
            { autoCommit: true}
        );
        return NextResponse.json({ result: "ok", imageUrl});
    } catch (err: any) {
        console.error("채팅 기록 API 에러::::::", err);
        return NextResponse.json({error: err.message}, {status: 500});
    } finally {
        if (conn) await conn.close();
    }
}