$NGINX_CONF_DIR = "C:\Program Files (x86)\NGINX\nginx-1.26.3\conf\conf.d"
$ACTIVE_SLOT_FILE = ".active_slot"

$CURRENT = Get-Content $ACTIVE_SLOT_FILE -ErrorAction SilentlyContinue
if ($CURRENT -eq "blue") {
    $NEXT = "green"
    $NEXT_PORT = 3001
    $CURRENT_APP="app-blue"
    $NEXT_APP="app-green"
} else {
    $NEXT="blue"
    $NEXT_PORT=3000
    $CURRENT_APP="app-green"
    $NEXT_APP = "app-blue"
}

Write-Host "현재 슬롯: $CURRENT -> 새 슬롯: $NEXT (포트: $NEXT_PORT)"

Write-Host "[1/5] Next.js 빌드 중..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "빌드 실패!" -ForegroundColor Red; exit 1
}

Write-Host "[2/5] $NEXT_APP 시작 중..."
pm2 delete $NEXT_APP -ErrorAction SilentlyContinue
pm2 start ecosystem.config.js --only $NEXT_APP
Start-Sleep -Seconds 5

Write-Host "[3/5] 헬스체크 중..."
$MAX_RETRY = 10
$OK = $false
for ($i =0; $i -lt $MAX_RETRY; $i++) {
    try {
        $res = Invoke-WebRequest -Uri "http://localhost:$NEXT_PORT" -UseBasicParsing -TimeoutSec 3
        if ($res.StatusCode -eq 200) { $OK = $true; break}
    } catch{}
    Write-Host "재시도 $($i+1)/$MAX_RETRY...."
    Start-Sleep -Seconds 2
}

if (-not $OK) {
    Write-Host "헬스체크 실패! 롤백합니다." -ForegroundColor Red
    pm2 delete $NEXT_APP 2>$null
    exit 1
}

Write-Host "[4/5] Nginx 스위칭 중..."
@"
set `$nextjs_upstream http://127.0.0.1:${NEXT_PORT};
set `$nextjs_ws ws://127.0.0.1:${NEXT_PORT};
"@ | Set-Content "$NGINX_CONF_DIR\service.conf"
nginx -p "C:\Program Files (x86)\NGINX\nginx-1.26.3" -s reload

Write-Host "[5/5] $CURRENT_APP 종료 중..."
pm2 delete $CURRENT_APP

Set-Content $ACTIVE_SLOT_FILE $NEXT

Write-Host "배포 완료! 현재 활성 슬롯: $NEXT (포트: $NEXT_PORT)" -ForegroundColor Green