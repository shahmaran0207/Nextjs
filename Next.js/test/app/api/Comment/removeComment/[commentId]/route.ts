import { NextResponse } from "next/server";
import { getConnection } from "@/util/database";

export async function POST(request: Request, { params }: {params: Promise<{commentId: string}>}) {
    const { commentId } = await params;

    let conn;
    try{
        conn = await getConnection();
        await conn.execute(
            `DELETE FROM TEST.POSTCOMMENT 
                WHERE ID = :commentId`,
            { commentId },
            { autoCommit: true }
        );
        return NextResponse.json({ result: "ok" });
    } catch(err: any) {
        console.log("댓글 삭제 API 에러:::::::::::::", err);
        return NextResponse.json({error: err.message}, { status: 500});
    } finally {
        if (conn) await conn.close();
    }    
}