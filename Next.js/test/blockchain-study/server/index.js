/**
 * server/index.js — 크로스체인 결제 모니터링 서버 (PostgreSQL 영구 DB 버전)
 * ─────────────────────────────────────────────────────────────────
 * 역할:
 *   1. 3개 체인(A, B, C)의 PaymentReceiver 이벤트를 동시 구독
 *   2. PaymentReceived 이벤트 감지 시 PostgreSQL에 주문 상태를 "paid"로 업데이트
 *   3. REST API로 프론트엔드에 주문 상태 제공
 *
 * [실행]
 *   node server/index.js
 *   (blockchain-study 디렉토리에서, Ganache 3개 실행 후)
 *
 * [API]
 *   POST /api/order            → 주문 생성, { orderId } 반환
 *   GET  /api/order/:orderId   → 주문 상태 조회
 *   GET  /api/health           → 서버 상태 확인
 * ─────────────────────────────────────────────────────────────────
 */

// .env 파일 로드 (Next.js 프로젝트 루트의 .env에서 DATABASE_URL 읽기)
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const express    = require("express");
const cors       = require("cors");
const { ethers } = require("ethers");
const fs         = require("fs");
const path       = require("path");

// Prisma Client: Next.js 프로젝트에서 생성된 클라이언트를 직접 참조
// schema.prisma의 output = "../app/generated/prisma" 경로
const { PrismaClient } = require("../../app/generated/prisma");
const prisma = new PrismaClient();

// ── 설정 ─────────────────────────────────────────────────────────

const PORT = 3001;

// 배포된 컨트랙트 주소 및 ABI 로드
const deployedPath = path.join(__dirname, "..", "deployed", "multichain-addresses.json");
if (!fs.existsSync(deployedPath)) {
  console.error("❌ multichain-addresses.json 파일이 없습니다.");
  console.error("   먼저 node scripts/deploy-multichain.js 를 실행하세요.");
  process.exit(1);
}
const deployedData = JSON.parse(fs.readFileSync(deployedPath, "utf-8"));

// ── Express 앱 설정 ──────────────────────────────────────────────

const app = express();
app.use(cors());
// CORS 허용: Next.js(localhost:3000) → 결제 서버(localhost:3001) 요청 가능
app.use(express.json());

// ── REST API ─────────────────────────────────────────────────────

// 주문 생성 (결제 시작 전 호출)
// POST /api/order
// Body: { amount: "0.01" }
app.post("/api/order", async (req, res) => {
  const { amount } = req.body;

  // 고유 주문번호 생성
  const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  try {
    await prisma.crypto_payment_orders.create({
      data: {
        order_id: orderId,
        status:   "pending",
        amount:   amount || null,
      },
    });

    console.log(`📋 주문 생성: ${orderId}`);
    res.json({ orderId });
  } catch (err) {
    console.error("주문 생성 실패:", err.message);
    res.status(500).json({ error: "주문 생성 실패" });
  }
});

// 주문 상태 조회 (프론트엔드 폴링용)
// GET /api/order/:orderId
app.get("/api/order/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await prisma.crypto_payment_orders.findUnique({
      where: { order_id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: "주문을 찾을 수 없습니다.", orderId });
    }

    res.json({
      orderId:   order.order_id,
      status:    order.status,
      amount:    order.amount,
      chainName: order.chain_name,
      payer:     order.payer,
      txHash:    order.tx_hash,
      paidAt:    order.paid_at,
      createdAt: order.created_at,
    });
  } catch (err) {
    console.error("주문 조회 실패:", err.message);
    res.status(500).json({ error: "주문 조회 실패" });
  }
});

// 서버 상태 확인
// GET /api/health
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    server: "Multi-Chain Payment Server (PostgreSQL)",
    port: PORT,
    chains: Object.entries(deployedData.chains).map(([name, info]) => ({
      name,
      chainId: info.chainId,
      address: info.address,
    })),
  });
});

// ── 블록체인 이벤트 구독 ─────────────────────────────────────────

async function subscribeToChain(chainName, chainInfo, abi) {
  console.log(`\n📡 ${chainName} (chainId: ${chainInfo.chainId}) 구독 시작...`);

  const provider = new ethers.JsonRpcProvider(chainInfo.rpcUrl);

  try {
    const network = await provider.getNetwork();
    console.log(`  ✅ ${chainName} 연결 성공 (chainId: ${network.chainId})`);
  } catch (e) {
    console.error(`  ❌ ${chainName} 연결 실패: ${e.message}`);
    return;
  }

  const contract = new ethers.Contract(chainInfo.address, abi, provider);

  // PaymentReceived 이벤트 구독
  contract.on("PaymentReceived", async (payer, amount, orderId, event) => {
    const amountEth = ethers.formatEther(amount);
    const txHash    = event.log.transactionHash;

    console.log(`\n💰 결제 감지!`);
    console.log(`   체인:     ${chainName}`);
    console.log(`   주문번호: ${orderId}`);
    console.log(`   결제자:   ${payer}`);
    console.log(`   금액:     ${amountEth} ETH`);
    console.log(`   TX Hash:  ${txHash}`);

    try {
      // upsert: 주문이 있으면 업데이트, 없으면 새로 생성
      await prisma.crypto_payment_orders.upsert({
        where: { order_id: orderId },
        update: {
          status:     "paid",
          chain_name: chainName,
          payer:      payer,
          tx_hash:    txHash,
          amount:     amountEth,
          paid_at:    new Date(),
        },
        create: {
          order_id:   orderId,
          status:     "paid",
          chain_name: chainName,
          payer:      payer,
          tx_hash:    txHash,
          amount:     amountEth,
          paid_at:    new Date(),
        },
      });
      console.log(`   ✅ DB 업데이트 완료: ${orderId} → paid`);
    } catch (err) {
      console.error(`   ❌ DB 업데이트 실패: ${err.message}`);
    }
  });

  console.log(`  👂 ${chainName} 이벤트 구독 완료 (컨트랙트: ${chainInfo.address})`);
}

// ── 서버 시작 ─────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Multi-Chain Payment Server (PostgreSQL 버전) 시작\n");
  console.log("=".repeat(60));

  // DB 연결 확인
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL 연결 성공");
  } catch (err) {
    console.error("❌ PostgreSQL 연결 실패:", err.message);
    process.exit(1);
  }

  // 모든 체인 이벤트 구독 (동시 실행)
  const subscribePromises = Object.entries(deployedData.chains).map(
    ([chainName, chainInfo]) => subscribeToChain(chainName, chainInfo, deployedData.abi)
  );
  await Promise.all(subscribePromises);

  // REST API 서버 시작
  app.listen(PORT, () => {
    console.log("\n" + "=".repeat(60));
    console.log(`✅ 결제 서버 실행 중: http://localhost:${PORT}`);
    console.log(`   POST http://localhost:${PORT}/api/order         (주문 생성)`);
    console.log(`   GET  http://localhost:${PORT}/api/order/:id     (주문 상태 조회)`);
    console.log(`   GET  http://localhost:${PORT}/api/health        (서버 상태)`);
    console.log("=".repeat(60));
  });

  // 프로세스 종료 시 Prisma 연결 해제
  process.on("SIGINT", async () => {
    console.log("\n👋 서버 종료 중...");
    await prisma.$disconnect();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("❌ 서버 시작 실패:", err.message);
  process.exit(1);
});
