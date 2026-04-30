import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'blockchain-study/deployed/defi-address.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "defi-address.json 파일이 존재하지 않습니다. 먼저 컨트랙트를 배포하세요." }, { status: 404 });
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("DeFi info read error:", error);
    return NextResponse.json({ error: "Failed to read defi-address.json" }, { status: 500 });
  }
}
