import { NextResponse } from "next/server";
import { getConnection } from "@/util/database";

export async function POST(request: Request, { params }: {params: Promise<{id: string}>}) {
    const { id } = await params;
    const formData = await request.formData();
    const title = formData.get("commentTitle") as string;
    const content = formData.get("commentContent") as string;
    const commentWriter = formData.get("writer") as string;

    let conn;
    try {
        conn = await getConnection();
        await conn.execute(
            `INSERT INTO POSTCOMMENT(POSTID, COMMENTTITLE, COMMENTCONTENT, COMMENTWRITER)
            VALUES (:id, :title, :content, :commentWriter)`, 
            {
                id,
                title,
                content,
                commentWriter
            },
            { autoCommit: true }
        );
        return NextResponse.json({ result: "ok" });
    } catch (err: any) {
        console.log("댓글 추가 에러:::::::::::::::", err);
        return NextResponse.json({error: err.message}, {status: 500});
    } finally {
        if (conn) await conn.close();
    }
    
}