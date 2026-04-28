/**
 * start-all.js
 * 터미널 하나에서 전체 서비스 순차/병렬 시작
 * 실행: node start-all.js
 */

const { spawn, execSync } = require("child_process");
const net = require("net");
const path = require("path");

const ROOT = __dirname;
const BC   = path.join(ROOT, "blockchain-study");
const PK   = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const BAL  = "1000000000000000000000";

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
// 포트 열릴 때까지 대기
// ──────────────────────────────────────────────────────────────
function waitForPort(port, maxMs = 15000) {
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
// 메인 시작 루틴
// ──────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${C.cyan}${"=".repeat(60)}`);
  console.log("  멀티코인 결제 시스템 — 통합 시작 (터미널 1개)");
  console.log(`${"=".repeat(60)}${C.reset}\n`);

  // ── Step 1: Ganache 3개 병렬 시작 ──────────────────────────
  console.log(`${C.yellow}[1/4] Ganache 3개 시작...${C.reset}`);
  const ganacheArgs = `--chain.chainId CHAIN_ID --server.port PORT --wallet.accounts "${PK},${BAL}"`;

  spawnService("Ganache-A", "npx", ["ganache",
    "--chain.chainId", "1337",
    "--server.port",  "8545",
    "--wallet.accounts", `${PK},${BAL}`
  ], ROOT);

  spawnService("Ganache-B", "npx", ["ganache",
    "--chain.chainId", "1338",
    "--server.port",  "8546",
    "--wallet.accounts", `${PK},${BAL}`
  ], ROOT);

  spawnService("Ganache-C", "npx", ["ganache",
    "--chain.chainId", "1339",
    "--server.port",  "8547",
    "--wallet.accounts", `${PK},${BAL}`
  ], ROOT);

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
  try {
    const deployProc = spawn("node", ["scripts/deploy-multichain.js"], {
      cwd: BC, shell: true, stdio: ["ignore", "pipe", "pipe"]
    });
    deployProc.stdout.on("data", d => log("Deploy", d.toString()));
    deployProc.stderr.on("data", d => log("Deploy", d.toString()));
    await new Promise((resolve, reject) => {
      deployProc.on("exit", code => code === 0 ? resolve() : reject(new Error(`배포 실패 (exit ${code})`)));
    });
    console.log(`${C.green}  ✅ 컨트랙트 배포 완료${C.reset}`);
  } catch (e) {
    console.error(`${C.red}  ❌ 배포 실패: ${e.message}${C.reset}`);
    process.exit(1);
  }

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
