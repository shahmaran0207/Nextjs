import { getConnection } from "@/util/database";
import oracledb from "oracledb";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT ID, TITLE, CONTENT, CREATEDAT, PUBLISHED, IMAGE FROM TEST.POST WHERE ID = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = result.rows as any[];

    const data = await Promise.all(rows.map(async (row) => {
      if (row.IMAGE) {
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (conn) await conn.close();
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let conn;
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const imageFile = formData.get("image") as File | null;

    let imageBuffer: Buffer | null = null;
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    }

    conn = await getConnection();

    if (imageBuffer) {
      await conn.execute(
        `UPDATE TEST.POST SET TITLE = :title, CONTENT = :content, IMAGE = :image WHERE ID = :id`,
        { title, content, image: imageBuffer, id },
        { autoCommit: true }
      );
    } else {
      await conn.execute(
        `UPDATE TEST.POST SET TITLE = :title, CONTENT = :content WHERE ID = :id`,
        { title, content, id },
        { autoCommit: true }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (conn) await conn.close();
  }
}