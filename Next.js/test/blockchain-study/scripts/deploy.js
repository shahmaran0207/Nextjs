/**
 * deploy.js
 * ─────────────────────────────────────────────────────────────────
 * 컴파일된 컨트랙트를 Ganache 로컬 블록체인에 배포합니다.
 *
 * [실행 전 필수 조건]
 * 1. 새 터미널을 열고 다음 명령어로 Ganache를 먼저 실행해야 함:
 *    npx ganache --chain.chainId 31337
 *
 * [배포 순서]
 * 1. GasToken   배포 → 주소 획득
 * 2. PayToken   배포 → 주소 획득
 * 3. DualPayment 배포 (위 두 주소를 인자로 넘김)
 * 4. 배포된 주소들을 deployed-addresses.json으로 저장
 *    (Next.js 앱이 이 파일을 읽어 컨트랙트에 접근)
 * ─────────────────────────────────────────────────────────────────
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const { compile } = require("./compile");

async function main() {
  console.log("🚀 배포 스크립트 시작\n");

  // ── 1. Ganache 로컬 네트워크에 연결 ─────────────────────────────
  // JsonRpcProvider = HTTP/JSON-RPC 방식으로 이더리움 노드에 연결하는 클라이언트.
  // MetaMask 없이 서버에서 직접 블록체인과 통신할 때 사용.
  // (프론트엔드에서는 BrowserProvider로 MetaMask와 통신하지만,
  //  스크립트/서버에서는 JsonRpcProvider로 직접 연결)
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // 연결 확인
  try {
    const network = await provider.getNetwork();
    console.log(`✅ Ganache 연결 성공! (Chain ID: ${network.chainId})`);
  } catch (e) {
    console.error("❌ Ganache에 연결할 수 없습니다.");
    console.error("   새 터미널에서 먼저 실행해주세요: npx ganache --chain.chainId 31337");
    process.exit(1);
  }

  // ── 2. 배포자(Deployer) 계정 설정 ────────────────────────────────
  // Ganache는 시작할 때 자동으로 테스트 계정 10개와 개인키를 생성해 줌.
  // 첫 번째 계정의 개인키를 사용해 Signer(서명자) 객체를 만듦.
  // ★ 실제 서비스에서는 절대로 개인키를 코드에 하드코딩하면 안 됨! .env에 보관할 것.
  const DEPLOYER_PRIVATE_KEY =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  // 이 키는 Ganache 기본 테스트 계정 #0의 개인키 (항상 동일, 가짜 돈)

  const deployer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
  // Wallet = 개인키 + Provider를 합친 서명 가능한 계정 객체.
  // 컨트랙트 배포, 함수 호출 시 이 deployer가 트랜잭션에 서명함.

  const balance = await provider.getBalance(deployer.address);
  console.log(`\n👤 배포자 주소: ${deployer.address}`);
  console.log(`💰 배포자 잔액: ${ethers.formatEther(balance)} ETH`);

  // ── 3. 컨트랙트 컴파일 ───────────────────────────────────────────
  const gasTokenCompiled  = compile("GasToken.sol",  "GasToken");
  const payTokenCompiled  = compile("PayToken.sol",  "PayToken");
  const dualPayCompiled   = compile("DualPayment.sol", "DualPayment");

  // ── 4. 컨트랙트 배포 헬퍼 함수 ──────────────────────────────────
  /**
   * @param {string} name - 배포할 컨트랙트 이름 (로그용)
   * @param {string} abi - 컨트랙트 ABI
   * @param {string} bytecode - 컨트랙트 바이트코드
   * @param {any[]} args - 생성자(constructor) 인자 배열
   * @returns {ethers.Contract} 배포된 컨트랙트 인스턴스
   */
  async function deploy(name, abi, bytecode, args = []) {
    console.log(`\n📦 ${name} 배포 중...`);

    const factory = new ethers.ContractFactory(abi, bytecode, deployer);

    // deploy() 호출 → 배포 트랜잭션 전송
    const contract = await factory.deploy(...args);

    // deploymentTransaction() = 배포 시 생성된 트랜잭션 객체
    // wait(1) = 1개의 블록 확인(confirmation)이 될 때까지 대기
    // receipt = 트랜잭션이 블록에 담긴 후 발급되는 영수증
    const receipt = await contract.deploymentTransaction().wait(1);

    // contractAddress = 영수증에 담긴 실제 배포 주소 (가장 확실한 방법)
    const address = receipt.contractAddress;

    console.log(`✅ ${name} 배포 완료! 주소: ${address}`);
    return { contract, address };
  }

  // ── 5. 순서대로 배포 ─────────────────────────────────────────────

  // GasToken 배포: 초기 발행량 1,000,000 GAS
  const { address: gasTokenAddr } = await deploy(
    "GasToken",
    gasTokenCompiled.abi,
    gasTokenCompiled.bytecode,
    [1_000_000] // constructor(initialSupply) 인자
  );

  // PayToken 배포: 초기 발행량 1,000,000 PAY
  const { address: payTokenAddr } = await deploy(
    "PayToken",
    payTokenCompiled.abi,
    payTokenCompiled.bytecode,
    [1_000_000]
  );

  // DualPayment 배포: 앞서 배포한 두 토큰 주소와 수수료율(5%) 전달
  const { address: dualPayAddr } = await deploy(
    "DualPayment",
    dualPayCompiled.abi,
    dualPayCompiled.bytecode,
    [
      gasTokenAddr,    // _gasTokenAddress
      payTokenAddr,    // _payTokenAddress
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // _feeCollector (Ganache 2번째 계정 = 배포자와 다른 계정)
      5,               // _feeRate (5%)
    ]
  );

  // ── 6. 배포 결과를 JSON 파일로 저장 ──────────────────────────────
  // Next.js 앱에서 이 파일을 읽어 컨트랙트 주소와 ABI를 사용함.
  const outputDir = path.join(__dirname, "..", "deployed");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const deployedData = {
    network: "localhost",
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      GasToken: {
        address: gasTokenAddr,
        abi: gasTokenCompiled.abi,
      },
      PayToken: {
        address: payTokenAddr,
        abi: payTokenCompiled.abi,
      },
      DualPayment: {
        address: dualPayAddr,
        abi: dualPayCompiled.abi,
      },
    },
  };

  const outputPath = path.join(outputDir, "deployed-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(deployedData, null, 2));
  console.log(`\n📄 배포 정보 저장 완료: ${outputPath}`);

  // ── 7. 배포 요약 출력 ─────────────────────────────────────────────
  console.log("\n" + "═".repeat(60));
  console.log("🎉 전체 배포 완료!");
  console.log("═".repeat(60));
  console.log(`  GasToken   (GAS): ${gasTokenAddr}`);
  console.log(`  PayToken   (PAY): ${payTokenAddr}`);
  console.log(`  DualPayment    : ${dualPayAddr}`);
  console.log("═".repeat(60));
  console.log("\n다음 단계:");
  console.log("  MetaMask → 네트워크 추가 → http://127.0.0.1:8545 (ChainID: 31337)");
  console.log("  MetaMask → 계정 가져오기 → 개인키: 0xac0974bec...");
  console.log("  Next.js 페이지에서 DualPayment 컨트랙트 연동 진행");
}

// ── 스크립트 실행 ─────────────────────────────────────────────────
main().catch((err) => {
  console.error("❌ 배포 실패:", err.message);
  process.exit(1);
});
