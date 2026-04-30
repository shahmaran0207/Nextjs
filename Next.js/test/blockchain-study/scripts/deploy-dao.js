/**
 * deploy-dao.js
 * ─────────────────────────────────────────────────────────────────
 * LandDAO.sol을 컴파일하고 Ganache 네트워크에 배포합니다.
 *
 * [배포 순서]
 * 1. 이미 배포된 LandNFT 주소를 읽어옵니다. (DAO는 LandNFT 주소를 알아야 함)
 * 2. LandDAO.sol 컴파일 (ABI, Bytecode 생성)
 * 3. Ethers.js를 사용해 배포 트랜잭션 전송
 * 4. 발급된 주소와 ABI를 deployed/land-dao-address.json 파일에 저장
 * ─────────────────────────────────────────────────────────────────
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const { compile } = require("./compile");

// .env 로드
try {
  require("dotenv").config({ path: path.join(__dirname, "../../.env") });
} catch (e) {
  console.warn("dotenv 없음, 환경 변수를 직접 사용합니다.");
}

async function main() {
  console.log("🚀 LandDAO 배포 시작...");

  // ── 1. 이미 배포된 LandNFT 정보 로드 ──────────────────────────
  const nftPath = path.join(__dirname, "..", "deployed", "land-nft-address.json");
  if (!fs.existsSync(nftPath)) {
    console.error("❌ LandNFT 배포 정보가 없습니다. deploy-land-nft.js를 먼저 실행하세요.");
    process.exit(1);
  }
  const landNFTData = JSON.parse(fs.readFileSync(nftPath, "utf-8"));
  const landNFTAddress = landNFTData.LandNFT.address;
  console.log(`🔗 연결할 LandNFT 주소: ${landNFTAddress}`);

  // ── 2. LandDAO.sol 컴파일 ──────────────────────────────────────
  // 여기서 .sol 파일을 읽어 ABI와 바이트코드를 만들어냅니다.
  const { abi, bytecode } = compile("LandDAO.sol", "LandDAO");

  // ── 3. 네트워크 및 지갑(배포자) 설정 ───────────────────────────
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const privateKey =
    process.env.ADMIN_PRIVATE_KEY ||
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const deployer = new ethers.Wallet(privateKey, provider);

  console.log(`👤 배포자 주소: ${deployer.address}`);

  // ── 4. 컨트랙트 배포 (스마트 컨트랙트 탄생) ────────────────────
  // ContractFactory: 배포를 도와주는 공장 (설명서 + 기계어 + 서명자)
  const factory = new ethers.ContractFactory(abi, bytecode, deployer);

  console.log("\n⏳ 배포 트랜잭션 전송 중...");
  // deploy() 인자로 생성자(constructor)에 필요한 LandNFT 주소를 넘겨줌
  const contract = await factory.deploy(landNFTAddress);

  // 블록에 포함될 때까지 대기
  await contract.waitForDeployment();

  // 배포 완료 후 발급된 고유 주소 획득
  const daoAddress = await contract.getAddress();
  console.log(`\n🎉 LandDAO 배포 성공!`);
  console.log(`📍 발급된 주소: ${daoAddress}`);

  // ── 5. 프론트엔드가 쓸 수 있게 저장 (ABI + 주소) ───────────────
  const outputData = {
    LandDAO: {
      address: daoAddress,
      abi: abi,
    },
    rpcUrl,
  };

  const outDir = path.join(__dirname, "..", "deployed");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, "land-dao-address.json");
  fs.writeFileSync(outPath, JSON.stringify(outputData, null, 2));

  console.log(`💾 배포 정보 저장 완료: ${outPath}`);
}

main().catch((err) => {
  console.error("❌ 배포 실패:", err);
  process.exit(1);
});
