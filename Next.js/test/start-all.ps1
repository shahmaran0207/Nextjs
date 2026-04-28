# ================================================================
# start-all.ps1
# 멀티코인 결제 시스템 전체 서비스 통합 시작 스크립트
# 사용법: .\start-all.ps1
# ================================================================

$ROOT      = $PSScriptRoot                          # 프로젝트 루트 (test/)
$BC        = Join-Path $ROOT "blockchain-study"     # blockchain-study/
$PK        = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
$BALANCE   = "1000000000000000000000"               # 1000 ETH (wei)

function Start-ServiceWindow {
    param(
        [string]$Title,
        [string]$WorkDir,
        [string]$Command
    )
    Start-Process powershell -ArgumentList `
        "-NoExit", `
        "-Command", `
        "`$host.UI.RawUI.WindowTitle = '$Title'; Set-Location '$WorkDir'; $Command" `
        -WindowStyle Normal
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  멀티코인 결제 시스템 — 전체 서비스 시작" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Ganache 3개 시작 ────────────────────────────────────────
Write-Host "[1/4] Ganache 블록체인 3개 시작 중..." -ForegroundColor Yellow

Start-ServiceWindow `
    -Title "Ganache Chain A (1337:8545)" `
    -WorkDir $ROOT `
    -Command "npx ganache --chain.chainId 1337 --server.port 8545 --wallet.accounts '`"$PK,$BALANCE`"'"

Start-ServiceWindow `
    -Title "Ganache Chain B (1338:8546)" `
    -WorkDir $ROOT `
    -Command "npx ganache --chain.chainId 1338 --server.port 8546 --wallet.accounts '`"$PK,$BALANCE`"'"

Start-ServiceWindow `
    -Title "Ganache Chain C (1339:8547)" `
    -WorkDir $ROOT `
    -Command "npx ganache --chain.chainId 1339 --server.port 8547 --wallet.accounts '`"$PK,$BALANCE`"'"

Write-Host "  ✅ Ganache 3개 창 오픈 완료" -ForegroundColor Green

# ── 2. Ganache 부팅 대기 ────────────────────────────────────────
Write-Host ""
Write-Host "[2/4] Ganache 부팅 대기 중 (5초)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# ── 3. 스마트컨트랙트 배포 ─────────────────────────────────────
Write-Host ""
Write-Host "[3/4] 스마트컨트랙트 배포 중..." -ForegroundColor Yellow

$deployResult = & node "$BC\scripts\deploy-multichain.js" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ 배포 실패! 오류 내용:" -ForegroundColor Red
    Write-Host $deployResult -ForegroundColor Red
    Write-Host ""
    Write-Host "  Ganache 창들이 정상적으로 실행되었는지 확인하세요." -ForegroundColor Yellow
    Read-Host "  계속하려면 Enter..."
} else {
    Write-Host "  ✅ 컨트랙트 배포 완료" -ForegroundColor Green
    Write-Host $deployResult -ForegroundColor DarkGray
}

# ── 4. Blockchain 결제 서버 시작 ────────────────────────────────
Write-Host ""
Write-Host "[4/4] 결제 서버 시작 중..." -ForegroundColor Yellow

Start-ServiceWindow `
    -Title "Payment Server (port 3001)" `
    -WorkDir $BC `
    -Command "node server/index.js"

Start-Sleep -Seconds 2
Write-Host "  ✅ 결제 서버 창 오픈 완료 (http://localhost:3001)" -ForegroundColor Green

# ── 5. Next.js 개발 서버 (현재 창) ─────────────────────────────
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  모든 서비스 시작 완료! Next.js 개발 서버를 시작합니다." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  포트 현황:" -ForegroundColor White
Write-Host "    3000  → Next.js" -ForegroundColor White
Write-Host "    3001  → 결제 서버" -ForegroundColor White
Write-Host "    8545  → Ganache Chain A (chainId: 1337)" -ForegroundColor White
Write-Host "    8546  → Ganache Chain B (chainId: 1338)" -ForegroundColor White
Write-Host "    8547  → Ganache Chain C (chainId: 1339)" -ForegroundColor White
Write-Host ""

Set-Location $ROOT
npm run dev
