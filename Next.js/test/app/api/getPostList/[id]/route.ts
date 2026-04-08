import { getConnection } from "@/util/database";
import oracledb from "oracledb";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT ID, TITLE, CONTENT, CREATEDAT, IMAGE FROM TEST.POST WHERE ID = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = result.rows as any[];
    const data = await Promise.all(rows.map(async (row) => {
      if (row.IMAGE) {
        //Oracle에서 BLOB 데이터는 조각으로 스트리밍 됨 -> 해당 조각들을 담을 배열
        const chunks: Buffer[] = [];
        await new Promise((resolve, reject) => {
          row.IMAGE.on("data", (chunk: Buffer) => chunks.push(chunk));
          row.IMAGE.on("end", resolve);
          row.IMAGE.on("error", reject);
        });
        row.IMAGE = Buffer.concat(chunks).toString("base64");
      }
      
      return row;
    }));

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("getPostList 에러:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (conn) await conn.close();
  }
}