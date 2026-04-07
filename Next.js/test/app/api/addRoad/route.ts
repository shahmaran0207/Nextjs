import { NextResponse } from "next/server";
import { getConnection } from "@/util/database";

export async function POST(request: Request) {

  let conn;
  try {
    const { roadName } = await request.json();

    conn = await getConnection();
    await conn.execute(
      `INSERT INTO TEST.ROAD (ROADNAME)
      VALUES (:roadName)`,
      { 
        roadName
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
