/**
 * start-all.js
 * 터미널 하나에서 전체 서비스 순차/병렬 시작
 * 실행: node start-all.js
 */

const { spawn, execSync } = require("child_process");
const net = require("net");
const path = require("path");

const ROOT    = __dirname;
const BC      = path.join(ROOT, "blockchain-study");
const PK      = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const BAL     = "1000000000000000000000";
// npx 오버헤드 없이 로컬 설치된 ganache.cmd 직접 사용
const GANACHE = path.join(BC, "node_modules", ".bin", "ganache.cmd");

// ──────────────────────────────────────────────────────────────
// 컬러 출력 헬퍼
// ──────────────────────────────────────────────────────────────
const C = {
  reset:  "\x1b[0m",
  cyan:   "\x1b[36m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  red:    "\x1b[31m",
  blue:   "\x1b[34m",
  purple: "\x1b[35m",
  gray:   "\x1b[90m",
  white:  "\x1b[37m",
};

const LABELS = {
  "Ganache-A": `${C.cyan}[Ganache-A]${C.reset}`,
  "Ganache-B": `${C.blue}[Ganache-B]${C.reset}`,
  "Ganache-C": `${C.purple}[Ganache-C]${C.reset}`,
  "PayServer": `${C.yellow}[PayServer]${C.reset}`,
  "Next.js":   `${C.green}[Next.js  ]${C.reset}`,
  "Deploy":    `${C.white}[Deploy   ]${C.reset}`,
};

function log(label, msg) {
  const prefix = LABELS[label] || `[${label}]`;
  String(msg).split("\n").filter(Boolean).forEach(line =>
    process.stdout.write(`${prefix} ${line}\n`)
  );
}

// ──────────────────────────────────────────────────────────────
// 포트 점유 프로세스 강제 종료 (Windows netstat + taskkill)
// ──────────────────────────────────────────────────────────────
function killPort(port) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
    const pids = new Set();
    out.split("\n").forEach(line => {
      // LISTENING 또는 ESTABLISHED 상태의 로컬 포트 매칭
      const m = line.match(/(?:LISTENING|ESTABLISHED)\s+(\d+)/);
      if (m) pids.add(m[1]);
    });
    pids.forEach(pid => {
      if (pid === "0") return;
      try { execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" }); } catch (_) {}
    });
    if (pids.size > 0) console.log(`  ${C.gray}포트 ${port} 정리 완료 (PID: ${[...pids].join(", ")})${C.reset}`);
  } catch (_) {
    // findstr이 아무것도 찾지 못하면 exit 1 → 정상(포트 비어있음)
  }
}

// ──────────────────────────────────────────────────────────────
// 포트 열릴 때까지 대기
// ──────────────────────────────────────────────────────────────
function waitForPort(port, maxMs = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tryConnect = () => {
      const client = new net.Socket();
      client.connect(port, "127.0.0.1", () => {
        client.destroy();
        resolve();
      });
      client.on("error", () => {
        client.destroy();
        if (Date.now() - start > maxMs) return reject(new Error(`포트 ${port} 타임아웃`));
        setTimeout(tryConnect, 500);
      });
    };
    tryConnect();
  });
}

// ──────────────────────────────────────────────────────────────
// 프로세스 스폰 (출력 prefix 붙이기)
// ──────────────────────────────────────────────────────────────
function spawnService(label, cmd, args, cwd) {
  const proc = spawn(cmd, args, { cwd, shell: true, stdio: ["ignore", "pipe", "pipe"] });
  proc.stdout.on("data", d => log(label, d.toString()));
  proc.stderr.on("data", d => log(label, d.toString()));
  proc.on("exit", code => {
    if (code !== null && code !== 0) log(label, `⚠️ 종료 (exit ${code})`);
  });
  return proc;
}

// ──────────────────────────────────────────────────────────────
// 테스트 계정 잔액 자동 충전 (evm_setAccountBalance)
// Ganache 재시작 후 MetaMask 캐시 여부와 무관하게 잔액 보장
// ──────────────────────────────────────────────────────────────
async function topUpBalances() {
  const http = require("http");
  // 충전할 계정 목록 (배포자 + MetaMask 자주 쓰는 테스트 계정)
  const ACCOUNTS = [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Account #0 (배포자)
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Account #1
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Account #2
  ];
  // 1000 ETH in hex wei (1000 * 10^18 = 0x3635C9ADC5DEA00000)
  const AMOUNT_HEX = "0x3635C9ADC5DEA00000";
  const CHAINS = [
    { label: "Chain A", port: 8545 },
    { label: "Chain B", port: 8546 },
    { label: "Chain C", port: 8547 },
  ];

  const rpcCall = (port, method, params) => new Promise((resolve) => {
    const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
    const req = http.request(
      { hostname: "127.0.0.1", port, path: "/", method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
      (res) => { res.on("data", () => {}); res.on("end", resolve); }
    );
    req.on("error", resolve); // 실패해도 계속 진행
    req.write(body);
    req.end();
  });

  console.log(`${C.gray}  💰 테스트 계정 잔액 충전 중...${C.reset}`);
  for (const chain of CHAINS) {
    for (const addr of ACCOUNTS) {
      await rpcCall(chain.port, "evm_setAccountBalance", [addr, AMOUNT_HEX]);
    }
    console.log(`  ${C.gray}✔ ${chain.label} (포트 ${chain.port}) 계정 충전 완료${C.reset}`);
  }
}

// ──────────────────────────────────────────────────────────────
// 메인 시작 루틴
// ──────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${C.cyan}${"=".repeat(60)}`);
  console.log("  멀티코인 결제 시스템 — 통합 시작 (터미널 1개)");
  console.log(`${"=".repeat(60)}${C.reset}\n`);

  // ── Step 0: 잔여 프로세스 정리 (재실행 시 EADDRINUSE 방지) ──────
  console.log(`${C.gray}[0/4] 이전 프로세스 정리 중...${C.reset}`);
  [8545, 8546, 8547, 3001, 3000].forEach(killPort);
  // TIME_WAIT 소켓이 해제될 시간 확보
  await new Promise(r => setTimeout(r, 1500));

  // ── Step 1: Ganache 3개 순차 시작 (npx 없이 로컬 바이너리 직접 실행) ──
  console.log(`${C.yellow}[1/4] Ganache 3개 시작...${C.reset}`);

  // Ganache 공통 실행 함수
  const startGanache = (label, chainId, port) => {
    spawnService(label, GANACHE, [
      "--chain.chainId",   String(chainId),
      "--chain.networkId", String(chainId),
      "--server.port",     String(port),
      "--wallet.accounts", `${PK},${BAL}`
    ], ROOT);
  };

  // 동시에 세 인스턴스를 띄우면 npx 캐시 경쟁으로 실패하므로 1초 간격으로 stagger
  startGanache("Ganache-A", 31337, 8545);
  await new Promise(r => setTimeout(r, 1000));
  startGanache("Ganache-B", 31338, 8546);
  await new Promise(r => setTimeout(r, 1000));
  startGanache("Ganache-C", 31339, 8547);

  // ── Step 2: 포트 열릴 때까지 대기 ─────────────────────────
  console.log(`${C.yellow}[2/4] 포트 대기 중 (8545, 8546, 8547)...${C.reset}`);
  try {
    await Promise.all([
      waitForPort(8545),
      waitForPort(8546),
      waitForPort(8547),
    ]);
    console.log(`${C.green}  ✅ Ganache 3개 준비 완료${C.reset}`);
  } catch (e) {
    console.error(`${C.red}  ❌ Ganache 시작 실패: ${e.message}${C.reset}`);
    process.exit(1);
  }

  // ── Step 3: 스마트컨트랙트 배포 ────────────────────────────
  console.log(`\n${C.yellow}[3/4] 컨트랙트 배포 중...${C.reset}`);
  
  const deployScript = async (scriptName) => {
    return new Promise((resolve, reject) => {
      const proc = spawn("node", [`scripts/${scriptName}`], {
        cwd: BC, shell: true, stdio: ["ignore", "pipe", "pipe"]
      });
      proc.stdout.on("data", d => log("Deploy", d.toString()));
      proc.stderr.on("data", d => log("Deploy", d.toString()));
      proc.on("exit", code => code === 0 ? resolve() : reject(new Error(`${scriptName} 배포 실패 (exit ${code})`)));
    });
  };

  try {
    await deployScript("deploy-multichain.js");
    await deployScript("deploy-land-nft.js");
    await deployScript("deploy-dao.js");
    await deployScript("deploy-mynft.js");
    await deployScript("deploy-marketplace.js");
    await deployScript("deploy-defi.js"); // Phase 1: DeFi 토큰 
    await deployScript("deploy-staking.js"); // Phase 2: Staking 금고
    await deployScript("deploy-tokenA.js"); // DEX Phase 1: 두 번째 교환 토큰
    await deployScript("deploy-amm.js");    // DEX Phase 2: AMM 풀 (x×y=k)
    await deployScript("deploy-oracle.js"); // Oracle: Chainlink Mock 가격 피드
    await deployScript("deploy-erc1155.js"); // ERC-1155: 게임 아이템 멀티 토큰
    await deployScript("deploy-proxy.js");  // Proxy Pattern: 업그레이더블 컨트랙트
    await deployScript("deploy-multisig.js"); // MultiSig: 다중 서명 지갑
    await deployScript("deploy-vesting.js"); // Token Vesting: 토큰 잠금 해제
    await deployScript("deploy-lending.js"); // Lending Protocol: 디파이 대출 및 청산
    console.log(`${C.green}  ✅ 모든 컨트랙트 배포 완료${C.reset}`);
  } catch (e) {
    console.error(`${C.red}  ❌ 배포 실패: ${e.message}${C.reset}`);
    process.exit(1);
  }

  // ── Step 3.6: DB 구획 → LandNFT 컨트랙트 자동 재등록 ──────────────
  // Ganache 재시작마다 컨트랙트가 초기화되므로 DB의 land_parcels를 다시 등록
  console.log(`${C.yellow}  📦 DB 구획 → 컨트랙트 재등록 중...${C.reset}`);
  try {
    await deployScript("register-parcel.js");
    console.log(`${C.green}  ✅ 구획 등록 완료${C.reset}`);
  } catch (e) {
    // 등록할 구획이 없거나 실패해도 전체 시작은 계속 진행
    console.log(`${C.yellow}  ⚠️ 구획 등록 건너뜀: ${e.message}${C.reset}`);
  }

  // ── Step 3.7: DB NFT 소유권 → LandNFT 컨트랙트 복원 ──────────────
  // ※ 제안 재등록보다 먼저 실행해야 함
  //   LandDAO.propose()는 NFT 보유자만 호출 가능하므로
  //   NFT 복원이 완료된 후에 제안을 재등록해야 revert 방지
  console.log(`${C.yellow}  🏠 DB NFT 소유권 → 컨트랙트 복원 중...${C.reset}`);
  try {
    await deployScript("restore-nft-ownership.js");
    console.log(`${C.green}  ✅ NFT 소유권 복원 완료${C.reset}`);
  } catch (e) {
    console.log(`${C.yellow}  ⚠️ NFT 복원 건너뜀: ${e.message}${C.reset}`);
  }

  // ── Step 3.8: DB 제안 → LandDAO 컨트랙트 자동 재등록 ──────────────
  // NFT 복원 완료 후 실행 (propose()는 NFT 보유자만 호출 가능)
  console.log(`${C.yellow}  📋 DB 제안 → DAO 컨트랙트 재등록 중...${C.reset}`);
  try {
    await deployScript("register-dao-proposals.js");
    console.log(`${C.green}  ✅ 제안 재등록 완료${C.reset}`);
  } catch (e) {
    console.log(`${C.yellow}  ⚠️ 제안 재등록 건너뜀: ${e.message}${C.reset}`);
  }

  // ── Step 3.5: 테스트 계정 잔액 충전 (MetaMask 캐시 무관하게 1000 ETH 보장) ──
  // Ganache evm_setAccountBalance 로 nonce 없이 즉시 설정
  await topUpBalances();

  // ── Step 4: 결제 서버 시작 ─────────────────────────────────
  console.log(`\n${C.yellow}[4/4] 결제 서버 시작...${C.reset}`);
  spawnService("PayServer", "node", ["server/index.js"], BC);

  // 결제 서버 포트 대기
  try {
    await waitForPort(3001, 10000);
    console.log(`${C.green}  ✅ 결제 서버 준비 완료 (http://localhost:3001)${C.reset}`);
  } catch (_) {
    console.log(`${C.yellow}  ⚠️ 결제 서버 포트 확인 실패 — 계속 진행${C.reset}`);
  }

  // ── Step 5: Next.js 개발 서버 ──────────────────────────────
  console.log(`\n${C.cyan}${"=".repeat(60)}`);
  console.log("  모든 서비스 준비 완료! Next.js 시작합니다");
  console.log("  포트: 3000(Next) 3001(결제) 8545-8547(Ganache)");
  console.log(`${"=".repeat(60)}${C.reset}\n`);

  spawnService("Next.js", "npm", ["run", "dev"], ROOT);

  // Ctrl+C 처리
  process.on("SIGINT", () => {
    console.log(`\n${C.yellow}모든 서비스 종료 중...${C.reset}`);
    process.exit(0);
  });
}

main().catch(e => {
  console.error(`${C.red}시작 오류: ${e.message}${C.reset}`);
  process.exit(1);
});
