import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "blockchain-study", "deployed", "erc1155-address.json");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "ERC1155 배포 정보를 찾을 수 없습니다." }, { status: 404 });
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}
