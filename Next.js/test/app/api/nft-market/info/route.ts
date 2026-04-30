import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// 프론트엔드에 MyNFT 컨트랙트 주소와 ABI를 제공하는 API
export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "blockchain-study",
      "deployed",
      "mynft-address.json"
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "컨트랙트가 아직 배포되지 않았습니다." },
        { status: 404 }
      );
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "컨트랙트 정보를 불러올 수 없습니다." },
      { status: 500 }
    );
  }
}
