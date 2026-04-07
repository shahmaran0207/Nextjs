import { getConnection } from "@/util/database";
import OracleDB from "oracledb";
import { NextResponse } from "next/server";

export async function GET(request: Request, {params}: {params: Promise<{sectionId: string}> }) {
    const { sectionId } = await params;
    let conn;
    try{
        conn = await getConnection();
        const result = await conn.execute(
            `SELECT SECTIONID, LINKID, SEQ FROM TEST.LINK  WHERE SECTIONID = :sectionId ORDER BY SEQ ASC`,
            {sectionId},
            { outFormat: OracleDB.OUT_FORMAT_OBJECT}
        );
        return NextResponse.json(result.rows);
    } catch (err: any) {
        return NextResponse.json({error: err.message }, { status: 500});
    } finally {
        if (conn) await conn.close();
    }
    
}