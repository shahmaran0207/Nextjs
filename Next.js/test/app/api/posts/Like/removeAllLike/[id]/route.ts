import { NextResponse } from "next/server";
import { getConnection } from "@/util/database";

export async function POST(request: Request, { params }: {params: Promise<{id: string}>}) {
    const { id } = await params;

    let conn;
    try {
        conn = await getConnection();
        await conn.execute(
            `DELETE FROM TEST.POSTLIKE WHERE POSTID = :id`,
            { id },
            { autoCommit: true}
        );
        return NextResponse.json({ result: "ok"});
    } catch(err: any) {
        console.error("관련 댓글 삭제 에러:::::", err);
        return NextResponse.json({error: err.message}, { status: 500})
    } finally {
        if (conn) await conn.close();
    }
}