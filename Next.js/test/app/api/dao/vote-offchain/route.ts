import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

// LandNFT 주소와 ABI를 가져오는 함수 (투표권 조회용)
function getLandNFTInfo() {
  const filePath = path.join(process.cwd(), "blockchain-study", "deployed", "land-nft-address.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return data.LandNFT;
}

export async function POST(req: Request) {
  try {
    // 프론트엔드에서 사용자가 메타마스크로 서명한 데이터들을 받아옵니다.
    const { proposalId, support, signature, voterAddress } = await req.json();

    // 1. 서명에 사용된 "원본 메시지" 재구성
    // 프론트엔드에서 서명할 때 유저에게 보여줬던 텍스트와 정확히 토씨 하나 안 틀리고 똑같아야 합니다.
    const message = `Vote on Proposal #${proposalId}\nSupport: ${support}`;

    // 2. 암호학적 서명 검증 (블록체인의 핵심 인증 기술)
    // 이 메시지와 서명(signature) 값을 ethers.verifyMessage에 넣으면,
    // 이 서명을 만들어낸 사람의 진짜 "지갑 주소"가 튀어나옵니다.
    const recoveredAddress = ethers.verifyMessage(message, signature);

    // 복호화해서 튀어나온 주소와, 클라이언트가 주장하는 주소가 다르면 조작된 서명입니다!
    if (recoveredAddress.toLowerCase() !== voterAddress.toLowerCase()) {
      return NextResponse.json({ error: "유효하지 않거나 위조된 서명입니다." }, { status: 401 });
    }

    // 3. 투표권(NFT) 개수 확인 (스마트 컨트랙트 단순 조회 - 가스비 0원)
    // 서명이 진짜라도 NFT가 없으면 투표를 받아주면 안 됩니다.
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const nftInfo = getLandNFTInfo();
    const nftContract = new ethers.Contract(nftInfo.address, nftInfo.abi, provider);

    const balance = await nftContract.balanceOf(recoveredAddress);
    const weight = Number(balance);

    if (weight === 0) {
      return NextResponse.json({ error: "투표권(LandNFT)이 없습니다." }, { status: 403 });
    }

    // 4. 중복 투표 체크 (명시적 조회 → 친절한 에러 메시지)
    const existing = await prisma.offchain_votes.findUnique({
      where: {
        proposal_id_voter: {
          proposal_id: proposalId,
          voter:        recoveredAddress.toLowerCase(),
        }
      }
    });
    if (existing) {
      return NextResponse.json(
        { error: "이미 이 안건에 투표하셨습니다. (찬성·반대 모두 1회만 가능)" },
        { status: 400 }
      );
    }

    // 5. 모든 검증 통과 → DB에 오프체인 투표 저장
    const vote = await prisma.offchain_votes.create({
      data: {
        proposal_id: proposalId,
        voter:       recoveredAddress.toLowerCase(),
        support:     support,
        weight:      weight,
        signature:   signature,
      }
    });

    return NextResponse.json({ success: true, vote });

  } catch (err: any) {
    console.error("[Off-chain Vote Error]", err);
    // 레이스 컨디션 등으로 unique 제약 위반 시 fallback
    if (err.code === 'P2002') {
      return NextResponse.json({ error: "이미 이 안건에 투표하셨습니다." }, { status: 400 });
    }
    return NextResponse.json({ error: "투표 처리 중 서버 오류가 발생했습니다." }, { status: 500 });
  }
}
