import { getConnection } from "@/util/database";
import oracledb from "oracledb";
import { NextResponse } from "next/server";

export async function GET(request: Request, {params}: {params: Promise<{roadId: string}> }) {
    const { roadId } = await params;
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT ID, LINKID, ROADID, SECTIONNAME
             FROM TEST.SECTION WHERE ROADID = :roadId ORDER BY ID DESC`,
            {roadId},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return NextResponse.json(result.rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
        if (conn) await conn.close();
    }
}