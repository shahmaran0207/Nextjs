import { getConnection } from "@/util/database";
import oracledb from "oracledb";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT ID, POSTID, COMMENTTITLE, COMMENTCONTENT FROM TEST.POSTCOMMENT WHERE POSTID = :id 
        ORDER BY ID DESC`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = result.rows as any[];

    const data = await Promise.all(rows.map(async (row) => {
      return row;
    }));

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (conn) await conn.close();
  }
}