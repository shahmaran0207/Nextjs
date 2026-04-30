import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

// ── GET: LandNFT 컨트랙트 주소 + ABI 반환 ──────────────────────────
// 프론트엔드 구매 버튼에서 ethers.Contract 생성 시 사용합니다.
// 파일 시스템에서 직접 읽으므로 서버 컴포넌트 전용입니다.
export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "blockchain-study",
      "deployed",
      "land-nft-address.json"
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "LandNFT가 아직 배포되지 않았습니다. deploy-land-nft.js를 실행해주세요." },
        { status: 404 }
      );
    }

    const raw  = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    return NextResponse.json({
      address:  data.LandNFT.address,
      abi:      data.LandNFT.abi,
      chainId:  data.chainId,
      network:  data.network,
    });
  } catch (err: any) {
    console.error("[LandNFT contract-address]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
