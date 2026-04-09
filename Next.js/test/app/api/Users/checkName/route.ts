import { NextResponse, NextRequest } from "next/server";
import { getConnection } from "@/util/database";
import oracledb from "oracledb";

export async function GET(request: NextRequest) {
    const name = request.nextUrl.searchParams.get("name");
    if (!name) return NextResponse.json({ exists: false });

    const conn = await getConnection();
    const result = await conn.execute(
        `SELECT 1 FROM TEST.USERS WHERE NAME = :name`,
        { name },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await conn.close();

    return NextResponse.json({ exists: (result.rows as any[]).length > 0 });
}
