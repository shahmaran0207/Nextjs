$NGINX_CONF_DIR = "C:\Program Files (x86)\NGINX\nginx-1.26.3\conf\conf.d"
$ACTIVE_SLOT_FILE = ".active_slot"
$CURRENT = (Get-Content $ACTIVE_SLOT_FILE -ErrorAction SilentlyContinue) -replace '\s',''

$nginxRunning = tasklist | findstr "nginx.exe"
if (-not $nginxRunning) {
    [Console]::WriteLine("Nginx starting...")
    Start-Process "C:\Program Files (x86)\NGINX\nginx-1.26.3\nginx.exe" -WorkingDirectory "C:\Program Files (x86)\NGINX\nginx-1.26.3"
    Start-Sleep -Seconds 2
}

if ($CURRENT -eq "blue") {
    $NEXT = "green"
    $NEXT_PORT = 3001
    $CURRENT_APP = "app-blue"
    $NEXT_APP = "app-green"
} else {
    $NEXT = "blue"
    $NEXT_PORT = 3000
    $CURRENT_APP = "app-green"
    $NEXT_APP = "app-blue"
}

[Console]::WriteLine("=== Deploy Start ===")
[Console]::WriteLine("Current: $CURRENT -> Next: $NEXT (Port: $NEXT_PORT)")
[Console]::WriteLine("")

# [1/5] Build
[Console]::WriteLine("[1/5] Building")
npm run build
if ($LASTEXITCODE -ne 0) { [Console]::WriteLine("[1/5] Building FAIL"); exit 1 }
[Console]::WriteLine("[1/5] Building OK")

# [2/5] Start app
[Console]::WriteLine("[2/5] Starting app")
pm2 delete $NEXT_APP 2>$null | Out-Null
pm2 start ecosystem.config.js --only $NEXT_APP --no-color
Start-Sleep -Seconds 10

# [3/5] Health check
[Console]::WriteLine("[3/5] Health check")
$MAX_RETRY = 10
$OK = $false
for ($i = 0; $i -lt $MAX_RETRY; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$NEXT_PORT" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) { $OK = $true; break }
    } catch {
        Start-Sleep -Seconds 3
    }
}
if (-not $OK) { [Console]::WriteLine("[3/5] Health check FAIL"); pm2 delete $NEXT_APP 2>$null | Out-Null; exit 1 }
[Console]::WriteLine("[3/5] Health check OK")

# [4/5] Nginx update
[Console]::WriteLine("[4/5] Nginx update")
$confPath = Join-Path $NGINX_CONF_DIR "service.conf"
$line1 = "set `$nextjs_upstream http://127.0.0.1:$NEXT_PORT;"
$line2 = "set `$nextjs_ws ws://127.0.0.1:$NEXT_PORT;"
$content = $line1 + [Environment]::NewLine + $line2
$encoding = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($confPath, $content, $encoding)
& "C:\Program Files (x86)\NGINX\nginx-1.26.3\nginx.exe" -p "C:\Program Files (x86)\NGINX\nginx-1.26.3" -s reload *>&1 | Out-Null
[Console]::WriteLine("[4/5] Nginx update OK")

# [5/5] Stop old app
[Console]::WriteLine("[5/5] Stopping old app")
pm2 delete $CURRENT_APP 2>$null | Out-Null
[Console]::WriteLine("[5/5] Stopping old app OK")

Set-Content $ACTIVE_SLOT_FILE $NEXT

[Console]::WriteLine("")
[Console]::WriteLine("=== Deploy Complete ===")
[Console]::WriteLine("Service: $NEXT (Port: $NEXT_PORT)")
