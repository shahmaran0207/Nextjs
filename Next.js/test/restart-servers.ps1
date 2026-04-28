# ================================================================
# restart-servers.ps1
# 결제 서버 + Next.js만 재시작 (Ganache는 이미 실행 중일 때)
# 사용법: .\restart-servers.ps1
# ================================================================

$ROOT = $PSScriptRoot
$BC   = Join-Path $ROOT "blockchain-study"

function Start-ServiceWindow {
    param([string]$Title, [string]$WorkDir, [string]$Command)
    Start-Process powershell -ArgumentList `
        "-NoExit", "-Command", `
        "`$host.UI.RawUI.WindowTitle = '$Title'; Set-Location '$WorkDir'; $Command"
}

Write-Host ""
Write-Host "=== 서버 재시작 ===" -ForegroundColor Cyan

# 결제 서버
Start-ServiceWindow `
    -Title "Payment Server (port 3001)" `
    -WorkDir $BC `
    -Command "node server/index.js"
Write-Host "✅ 결제 서버 시작됨" -ForegroundColor Green

Start-Sleep -Seconds 2

# Next.js (현재 창)
Write-Host "✅ Next.js 시작 중..." -ForegroundColor Green
Set-Location $ROOT
npm run dev
