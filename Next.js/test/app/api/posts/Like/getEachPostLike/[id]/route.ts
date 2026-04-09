import { getConnection } from "@/util/database";
import oracledb from "oracledb";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{id: string}>}) {
    const { id } = await params;
    const name = new URL(request.url).searchParams.get("name");

    let conn;

    try {
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT ID, POSTID, USERID FROM TEST.POSTLIKE
                WHERE POSTID =:id AND USERID =:name`,
            { id, name},
            { outFormat: oracledb.OUT_FORMAT_OBJECT}
        );

        const rows = result.rows as any[];
        const data = await Promise.all(rows.map(async (row) => {
            return row;
        }));

        return NextResponse.json(data);
    } catch(err: any) {
        console.error("getPostLike API 에러:::::::::::", err);
        return NextResponse.json({status: 500});
    } finally {
        if (conn) await conn.close();
    }

}