import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "blockchain-study",
      "deployed",
      "marketplace-address.json"
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Marketplace 컨트랙트가 배포되지 않았습니다." },
        { status: 404 }
      );
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "마켓플레이스 정보를 불러올 수 없습니다." },
      { status: 500 }
    );
  }
}
