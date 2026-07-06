# MoneyPrinterTurbo Interface Auto-Launcher Script

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  MoneyPrinterTurbo Interface Auto-Launcher (PowerShell)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend"

# 1. Setup Backend
Write-Host "`n[1/3] Checking backend virtual environment..." -ForegroundColor Yellow
$VenvPath = Join-Path $BackendDir ".venv"
if (-not (Test-Path $VenvPath)) {
    Write-Host "Virtual environment not found. Creating one..." -ForegroundColor Gray
    Start-Process python -ArgumentList "-m venv $VenvPath" -Wait -NoNewWindow
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create Python virtual environment."
        Exit 1
    }
}

# 2. Install Backend Dependencies
Write-Host "`n[2/3] Installing backend dependencies..." -ForegroundColor Yellow
$PythonExe = Join-Path $VenvPath "Scripts\python.exe"
$PipExe = Join-Path $VenvPath "Scripts\pip.exe"
$ReqFile = Join-Path $BackendDir "requirements.txt"

Start-Process $PythonExe -ArgumentList "-m pip install --upgrade pip" -Wait -NoNewWindow
Start-Process $PipExe -ArgumentList "install -r $ReqFile" -Wait -NoNewWindow

# 3. Install Frontend Dependencies
Write-Host "`n[3/3] Checking frontend dependencies..." -ForegroundColor Yellow
$NodeModulesPath = Join-Path $FrontendDir "node_modules"
if (-not (Test-Path $NodeModulesPath)) {
    Write-Host "Frontend node_modules not found. Running npm install..." -ForegroundColor Gray
    Set-Location $FrontendDir
    Start-Process npm -ArgumentList "install" -Wait -NoNewWindow
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install frontend dependencies."
        Exit 1
    }
} else {
    Write-Host "Frontend node_modules already exists. Skipping npm install." -ForegroundColor Gray
}

# 4. Start Servers Concurrently
Write-Host "`n===================================================" -ForegroundColor Cyan
Write-Host "  Starting Backend and Frontend concurrently..." -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# Start FastAPI Backend in a new window
Write-Host "Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k cd /d `"$BackendDir`" && `"$PythonExe`" main.py" -WindowStyle Normal

# Start Vite Frontend in a new window
Write-Host "Starting Vite Frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k cd /d `"$FrontendDir`" && npm run dev" -WindowStyle Normal

Write-Host "`nBoth servers have been launched in separate windows!" -ForegroundColor Green
Write-Host "  - Backend: http://localhost:8000" -ForegroundColor Gray
Write-Host "  - Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host "Press any key to exit this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
