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
      paidAt:      order.paid_at,
      createdAt:   order.created_at,
    });
  } catch (err) {
    console.error("주문 조회 실패:", err.message);
    res.status(500).json({ error: "주문 조회 실패" });
  }
});

// 체인 + 토큰 설정 제공 (프론트엔드가 이 API로 주소를 받아감)
// GET /api/crypto/chains
app.get("/api/crypto/chains", (req, res) => {
  const chains = Object.entries(deployed.chains).map(([name, info]) => ({
    name,
    chainId:         info.chainId,
    rpcUrl:          info.rpcUrl,
    paymentReceiver: info.paymentReceiver,
    tokens: Object.values(info.tokens),
  }));
  res.json({ chains });
});

// 서버 상태
// GET /api/health
app.get("/api/health", (req, res) => {
  res.json({ ok: true, port: PORT, chains: Object.keys(deployed.chains) });
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

  // ── ETH 결제 이벤트 ─────────────────────────────────────────
  contract.on("PaymentReceived", async (payer, amount, orderId, recipient, event) => {
    const amountEth = ethers.formatEther(amount);
    const txHash    = event.log.transactionHash;

    console.log(`\n💰 ETH 결제 감지!`);
    console.log(`   체인:     ${chainName}`);
    console.log(`   주문:     ${orderId}`);
    console.log(`   결제자:   ${payer}`);
    console.log(`   판매자:   ${recipient}`);
    console.log(`   금액:     ${amountEth} ETH`);
    console.log(`   TxHash:   ${txHash}`);

    // 트랜잭션 영수증 조회 (뻔록번호, 실제 가스비, 성공 여부)
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
          status:        "paid",
          chain_name:    chainName,
          payer,
          seller_wallet: recipient,
          tx_hash:       txHash,
          amount:        amountEth,
          token_symbol:  "ETH",
          paid_at:       new Date(),
          ...receiptData,
        },
        create: {
          order_id:      orderId,
          status:        "paid",
          chain_name:    chainName,
          payer,
          seller_wallet: recipient,
          tx_hash:       txHash,
          amount:        amountEth,
          token_symbol:  "ETH",
          paid_at:       new Date(),
          ...receiptData,
        },
      });
      console.log(`   DB 업데이트 완료 → paid (ETH)`);
    } catch (err) {
      console.error(`   DB 업데이트 실패: ${err.message}`);
    }
  });

  // ── ERC-20 결제 이벤트 ────────────────────────────────────────
  contract.on("ERC20PaymentReceived", async (payer, recipient, orderId, tokenAddress, amount, event) => {
    const txHash = event.log.transactionHash;

    // 토큰 주소로 심볼 역조회
    const tokenInfo = Object.values(chainInfo.tokens).find(
      t => t.address && t.address.toLowerCase() === tokenAddress.toLowerCase()
    );
    const tokenSymbol   = tokenInfo?.symbol   ?? "UNKNOWN";
    const tokenDecimals = tokenInfo?.decimals ?? 18;
    const amountFormatted = ethers.formatUnits(amount, tokenDecimals);

    console.log(`\n🪙 ERC-20 결제 감지!`);
    console.log(`   체인:     ${chainName}`);
    console.log(`   주문:     ${orderId}`);
    console.log(`   결제자:   ${payer}`);
    console.log(`   판매자:   ${recipient}`);
    console.log(`   토큰:     ${tokenSymbol} (${tokenAddress})`);
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
          status:        "paid",
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
          status:        "paid",
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
      console.log(`   DB 업데이트 완료 → paid (${tokenSymbol})`);
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
  app.listen(PORT, () => {
    console.log("\n" + "=".repeat(60));
    console.log(`✅ 결제 서버: http://localhost:${PORT}`);
    console.log(`   POST /api/order           주문 생성`);
    console.log(`   GET  /api/order/:id       주문 조회`);
    console.log(`   GET  /api/crypto/chains   체인/토큰 설정`);
    console.log(`   GET  /api/health          서버 상태`);
    console.log("=".repeat(60));
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
