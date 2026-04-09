import { NextResponse } from "next/server";
import { getConnection } from "@/util/database";
import oracledb from "oracledb";

export async function POST(request: Request, { params }:{ params: Promise<{id: string}>}) {
    const { id }  = await params;
    const name = new URL(request.url).searchParams.get("name");

    let conn;

    try {
        conn = await getConnection();
        const result = await conn.execute(
            `INSERT INTO TEST.POSTLIKE (POSTID, USERID)
                VALUES(:id, :name)`,
        { id, name},
        { autoCommit: true}
        );
    } catch(err: any) {
        console.error("게시글 좋아요 추가 API 에러:::::::::",err);
        return NextResponse.json({ error: err.message}, { status: 500});
    } finally {
        if (conn) await conn.close();
    }
}