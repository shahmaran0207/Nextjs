import { getConnection } from "@/util/database";
import oracledb from "oracledb";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{id: string}>}) {
    const { id } = await params;
    const name = new URL(request.url).searchParams.get("name");

    let conn;

    try {
        conn = await getConnection();
        const reuslt = await conn.execute(
            `DELETE FROM TEST.POSTLIKE
                WHERE POSTID=:id AND USERID =:name`,
            { id, name },
            { autoCommit: true}
        );
        return NextResponse.json({result: "ok"})
    } catch (err: any) {
        console.error("DB 에러:::::::", err);
        return NextResponse.json({ error: err.message}, { status:500});
    } finally {
        if (conn) await conn.close();
    }
}