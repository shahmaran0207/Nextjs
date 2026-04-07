import { NextResponse } from "next/server";
import { getConnection } from "@/util/database";
import oracledb from "oracledb";

export async function POST(request: Request) {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const image = formData.get("image") as File;
  const imageBuffer = image ? Buffer.from(await image.arrayBuffer()) : null;

  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `INSERT INTO POST (TITLE, CONTENT, CREATEDAT, IMAGE) 
      VALUES (:title, :content, SYSDATE, :image)`,
      { 
        title, 
        content, 
        image: { val: imageBuffer, type: oracledb.BLOB }
      },
      { autoCommit: true }
    );
    return NextResponse.json({ result: "ok" });
  } catch (err: any) {
    console.error("DB 에러:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (conn) await conn.close();
  }
}
