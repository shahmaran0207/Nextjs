import { NextResponse } from "next/server";
import { getConnection } from "@/util/database";

export async function POST(request:Request) {

    let conn;
    
    try{
        const { sectionName, roadId } = await request.json();

        conn = await getConnection();
        await conn.execute(
            `INSERT INTO TEST.SECTION (ROADID, SECTIONNAME)
            VALUES(:roadId, :sectionName)`,
            {
                roadId, sectionName
            },
            { autoCommit: true }
        );
        return NextResponse.json({result: "ok"});
    } catch(err: any) {
        console.error("DB 에러::::", err);
    } finally {
        if (conn) await conn.close();
    }
}