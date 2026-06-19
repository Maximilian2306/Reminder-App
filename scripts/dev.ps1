param([int]$Port = 5173)

# Kill any existing process on the target port
$lines = netstat -ano | Select-String ":$Port\s"
foreach ($line in $lines) {
  $p = ($line.ToString().Trim() -split '\s+')[-1]
  if ($p -match '^\d+$' -and $p -ne '0') {
    Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    Write-Host "Killed old process on port $Port (PID $p)"
  }
}

# Register cleanup on Ctrl+C so the port is freed even if PowerShell exits
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
  Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

Write-Host "Starting Vite on port $Port..."
npx vite --port $Port
