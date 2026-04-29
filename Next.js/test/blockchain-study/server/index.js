/**
 * server/index.js — 멀티코인 멀티체인 결제 모니터링 서버
 * ─────────────────────────────────────────────────────────────────
 * 역할:
 *   1. 3개 체인(A/B/C)의 PaymentReceiver 이벤트를 동시 구독
 *      - PaymentReceived      (ETH 결제)
 *      - ERC20PaymentReceived (USDC/DAI 결제)
 *   2. 이벤트 감지 시 PostgreSQL 주문 상태를 "paid"로 업데이트
 *   3. REST API로 프론트엔드에 주문 상태 제공
 *   4. GET /api/crypto/chains — 체인/토큰 설정 정보 제공 (프론트엔드용)
 *
 * [실행]
 *   node server/index.js
 *   (blockchain-study 디렉토리에서, Ganache 3개 + deploy 완료 후)
 *
 * [API]
 *   POST /api/order              → 주문 생성
 *   GET  /api/order/:orderId     → 주문 상태 조회
 *   GET  /api/crypto/chains      → 체인 + 토큰 주소 목록
 *   GET  /api/health             → 서버 상태
 * ─────────────────────────────────────────────────────────────────
 */

require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const express    = require("express");
const cors       = require("cors");
const { ethers } = require("ethers");
const fs         = require("fs");
const path       = require("path");
const bodyParser = require("body-parser");
const WebSocket = require("ws");

const { PrismaClient } = require("../../app/generated/prisma");
const prisma = new PrismaClient();

// ── 배포 정보 로드 ────────────────────────────────────────────────
const deployedPath = path.join(__dirname, "..", "deployed", "multichain-addresses.json");
if (!fs.existsSync(deployedPath)) {
  console.error("❌ multichain-addresses.json 없음. 먼저 deploy-multichain.js 실행하세요.");
  process.exit(1);
}
const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf-8"));

const PORT = 3001;

// ── Express 설정 ─────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// ── REST API ─────────────────────────────────────────────────────

// 주문 생성
// POST /api/order
// Body: { amount, tokenSymbol, sellerWallet, productId, buyerEmail }
app.post("/api/order", async (req, res) => {
  const { 
    amount, tokenSymbol, sellerWallet, productId, buyerEmail,
    receiverName, receiverPhone, shippingAddress, shippingMessage
  } = req.body;
  const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  try {
    await prisma.crypto_payment_orders.create({
      data: {
        order_id:      orderId,
        status:        "pending",
        amount:        amount       || null,
        token_symbol:  tokenSymbol  || null,   // ETH / USDC / DAI
        seller_wallet: sellerWallet || null,
        product_id:    productId    || null,
        buyer_email:   buyerEmail   || null,   // 구매자 이메일 (주문내역 연동용)
        receiver_name:    receiverName    || null,
        receiver_phone:   receiverPhone   || null,
        shipping_address: shippingAddress || null,
        shipping_message: shippingMessage || null,
      },
    });

    console.log(`주문 생성: ${orderId}  token=${tokenSymbol}  buyer=${buyerEmail}  seller=${sellerWallet}`);
    res.json({ orderId });
  } catch (err) {
    console.error("주문 생성 실패:", err.message);
    res.status(500).json({ error: "주문 생성 실패" });
  }
});

// 주문 상태 조회
// GET /api/order/:orderId
app.get("/api/order/:orderId", async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await prisma.crypto_payment_orders.findUnique({
      where: { order_id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: "주문 없음", orderId });
    }

    res.json({
      orderId:     order.order_id,
      status:      order.status,
      amount:      order.amount,
      tokenSymbol: order.token_symbol,
      chainName:   order.chain_name,
      payer:       order.payer,
      txHash:      order.tx_hash,
    });
  } catch (err) {
    console.error("주문 조회 실패:", err.message);
    res.status(500).json({ error: "주문 조회 실패" });
  }
});

// 체인 설정 정보 제공 (프론트엔드 연동용)
// GET /api/crypto/chains
app.get("/api/crypto/chains", (req, res) => {
  // 배포된 체인 정보 반환
  const chains = Object.entries(deployed.chains).map(([name, c]) => ({
    name: name,
    chainId: c.chainId,
    rpcUrl: c.rpcUrl,
    paymentReceiver: c.paymentReceiver,
    tokens: c.tokens,
  }));
  res.json({ chains });
});

// 서버 상태
// GET /api/health
app.get("/api/health", (req, res) => {
  res.json({ ok: true, port: PORT, chains: Object.keys(deployed.chains) });
});
// 자금 해제 (Release) API (오라클 역할)
// POST /api/crypto/release
// Body: { orderId }
app.post("/api/crypto/release", async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ error: "orderId required" });

  try {
    const order = await prisma.crypto_payment_orders.findUnique({
      where: { order_id: orderId }
    });

    if (!order) return res.status(404).json({ error: "주문 없음" });
    if (order.status !== "escrow_locked") {
      return res.status(400).json({ error: `현재 상태(${order.status})에서는 자금을 해제할 수 없습니다.` });
    }

    const chainName = order.chain_name;
    const chainInfo = deployed.chains[chainName];
    if (!chainInfo) return res.status(500).json({ error: "체인 정보 찾을 수 없음" });

    // 관리자(Owner) 지갑 연동
    const provider = new ethers.JsonRpcProvider(chainInfo.rpcUrl);
    // [경고] 로컬 테스트 환경이므로 하드코딩된 개인키를 사용합니다. 실무에서는 절대 안 됩니다!
    const ADMIN_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const adminWallet = new ethers.Wallet(ADMIN_KEY, provider);

    const contract = new ethers.Contract(
      chainInfo.paymentReceiver,
      deployed.paymentReceiverAbi,
      adminWallet // 읽기/쓰기가 모두 가능하도록 signer 연결
    );

    console.log(`\n🔓 [오라클] 자금 해제 트랜잭션 전송 시작 (${orderId})`);
    
    // 스마트 컨트랙트의 releaseFunds 호출 (가스비 발생)
    const tx = await contract.releaseFunds(orderId);
    console.log(`   트랜잭션 해시: ${tx.hash}`);
    await tx.wait(); // 블록 확정 대기
    console.log(`   트랜잭션 확정 완료!`);

    // DB 상태 업데이트
    await prisma.crypto_payment_orders.update({
      where: { order_id: orderId },
      data: { status: "released" }
    });

    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error("자금 해제 실패:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── 블록체인 이벤트 구독 ─────────────────────────────────────────

async function subscribeToChain(chainName, chainInfo) {
  console.log(`\n📡 [${chainName}] chainId=${chainInfo.chainId} 구독 시작...`);

  const provider = new ethers.JsonRpcProvider(chainInfo.rpcUrl);

  try {
    const net = await provider.getNetwork();
    console.log(`  ✅ 연결 성공 (chainId: ${net.chainId})`);
  } catch (e) {
    console.error(`  ❌ ${chainName} 연결 실패: ${e.message}`);
    return;
  }

  const contract = new ethers.Contract(
    chainInfo.paymentReceiver,
    deployed.paymentReceiverAbi,
    provider
  );

  // ── 에스크로 자금 잠금(FundsLocked) 이벤트 ─────────────────────
  contract.on("FundsLocked", async (orderId, payer, recipient, tokenAddress, amount, event) => {
    const txHash = event.log.transactionHash;

    let tokenSymbol = "ETH";
    let amountFormatted = ethers.formatEther(amount);

    if (tokenAddress !== ethers.ZeroAddress) {
      const tokenInfo = Object.values(chainInfo.tokens).find(
        t => t.address && t.address.toLowerCase() === tokenAddress.toLowerCase()
      );
      tokenSymbol = tokenInfo?.symbol ?? "UNKNOWN";
      const tokenDecimals = tokenInfo?.decimals ?? 18;
      amountFormatted = ethers.formatUnits(amount, tokenDecimals);
    }

    console.log(`\n🔒 에스크로 자금 잠금(Lock) 감지!`);
    console.log(`   체인:     ${chainName}`);
    console.log(`   주문:     ${orderId}`);
    console.log(`   결제자:   ${payer}`);
    console.log(`   판매자:   ${recipient}`);
    console.log(`   토큰:     ${tokenSymbol} (${tokenAddress === ethers.ZeroAddress ? 'Native' : tokenAddress})`);
    console.log(`   금액:     ${amountFormatted} ${tokenSymbol}`);
    console.log(`   TxHash:   ${txHash}`);

    // 트랜잭션 영수증 조회
    let receiptData = {};
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      if (receipt) {
        const gasCostWei = receipt.gasUsed * receipt.gasPrice;
        receiptData = {
          block_number:   receipt.blockNumber,
          gas_used:       parseFloat(ethers.formatEther(gasCostWei)).toFixed(8),
          gas_used_units: receipt.gasUsed.toString(),
          tx_status:      receipt.status ?? 1,
        };
        console.log(`   영수증:    block=#${receipt.blockNumber}  gas=${receiptData.gas_used} ETH  status=${receipt.status}`);
      }
    } catch (receiptErr) {
      console.warn(`   영수증 조회 실패: ${receiptErr.message}`);
    }

    try {
      await prisma.crypto_payment_orders.upsert({
        where:  { order_id: orderId },
        update: {
          status:        "escrow_locked", // 에스크로 보관 상태로 변경
          chain_name:    chainName,
          payer,
          seller_wallet: recipient,
          tx_hash:       txHash,
          amount:        amountFormatted,
          token_symbol:  tokenSymbol,
          paid_at:       new Date(),
          ...receiptData,
        },
        create: {
          order_id:      orderId,
          status:        "escrow_locked", // 에스크로 보관 상태로 생성
          chain_name:    chainName,
          payer,
          seller_wallet: recipient,
          tx_hash:       txHash,
          amount:        amountFormatted,
          token_symbol:  tokenSymbol,
          paid_at:       new Date(),
          ...receiptData,
        },
      });
      console.log(`   DB 업데이트 완료 → escrow_locked (${tokenSymbol})`);

      // 판매자 알림 추가
      try {
        const orderData = await prisma.crypto_payment_orders.findUnique({ where: { order_id: orderId } });
        if (orderData && orderData.product_id) {
          const product = await prisma.products.findUnique({ where: { id: Number(orderData.product_id) } });
          if (product && product.seller_id) {
            await prisma.notifications.create({
              data: {
                user_id: Number(product.seller_id),
                title: "새로운 주문이 들어왔습니다! 💰",
                message: `[${product.name}] 상품이 ${tokenSymbol} 코인으로 결제/에스크로 보관되었습니다. (주문: ${orderId})`,
                link: "/seller/orders",
                is_read: false
              }
            });
            console.log(`   판매자 알림 전송 완료 (seller_id: ${product.seller_id})`);
          }
        }
      } catch (notifyErr) {
        console.error(`   판매자 알림 실패: ${notifyErr.message}`);
      }
    } catch (err) {
      console.error(`   DB 업데이트 실패: ${err.message}`);
    }
  });

  console.log(`  👂 [${chainName}] ETH + ERC-20 이벤트 구독 완료`);
}

// ── 서버 시작 ─────────────────────────────────────────────────────
async function main() {
  console.log("🚀 멀티코인 결제 서버 시작\n");
  console.log("=".repeat(60));

  // DB 연결
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL 연결 성공");
  } catch (err) {
    console.error("❌ PostgreSQL 연결 실패:", err.message);
    process.exit(1);
  }

  // 3개 체인 이벤트 구독
  await Promise.all(
    Object.entries(deployed.chains).map(([name, info]) => subscribeToChain(name, info))
  );

  // REST 서버 시작
  const server = app.listen(PORT, () => {
    console.log(`\n💳 [PayServer] 결제 수신 서버 시작 (포트: ${PORT})`);
    console.log("=".repeat(60));
    console.log(`✅ 결제 서버: http://localhost:${PORT}`);
    console.log(`   POST /api/order           주문 생성`);
    console.log(`   GET  /api/order/:id       주문 조회`);
    console.log(`   GET  /api/crypto/chains   체인/토큰 설정`);
    console.log(`   GET  /api/health          서버 상태`);
    console.log("=".repeat(60));
  });

  // WebSocket Server for Real-time Notifications
  const wss = new WebSocket.Server({ server });
  wss.on('connection', (ws) => {
    console.log('[PayServer] WebSocket 클라이언트 연결됨');
    ws.on('close', () => console.log('[PayServer] WebSocket 클라이언트 연결 해제'));
  });

  // REST API to trigger WebSocket broadcast
  app.post("/api/notify-shipping", (req, res) => {
    const { orderId, trackingNumber } = req.body;
    if (orderId && trackingNumber) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'SHIPPING_UPDATED', orderId: String(orderId), trackingNumber }));
        }
      });
      console.log(`[PayServer] 운송장 업데이트 웹소켓 브로드캐스트 (주문: ${orderId})`);
    }
    res.json({ success: true });
  });

  process.on("SIGINT", async () => {
    console.log("\n👋 서버 종료...");
    await prisma.$disconnect();
    process.exit(0);
  });
}

main().catch(err => {
  console.error("❌ 서버 시작 실패:", err.message);
  process.exit(1);
});
