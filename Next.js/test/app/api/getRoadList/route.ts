import { getConnection } from "@/util/database";
import oracledb from "oracledb";
import { NextResponse } from "next/server";

export async function GET() {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT ID, ROADNAME, SECTIONID FROM TEST.ROAD ORDER BY ID DESC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return NextResponse.json(result.rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
        if (conn) await conn.close();
    }
}
