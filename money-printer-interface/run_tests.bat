@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   MoneyPrinterTurbo Test Runner
echo ===================================================

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"

echo [1/3] Preparing backend environment...
if not exist "%BACKEND_DIR%\.venv" (
    echo [ERROR] Virtual environment not found. Creating one...
    python -m venv "%BACKEND_DIR%\.venv"
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to create Python virtual environment.
        exit /b 1
    )
)

call "%BACKEND_DIR%\.venv\Scripts\activate.bat"
echo Installing backend requirements...
python -m pip install --upgrade pip
pip install -r "%BACKEND_DIR%\requirements.txt"
if !errorlevel! neq 0 (
    echo [ERROR] Failed to install requirements.
    exit /b 1
)

echo [2/3] Starting backend server in background...
start /B "MockBackend" cmd /c "cd /d "%BACKEND_DIR%" && call .venv\Scripts\activate.bat && python main.py"
echo Waiting for backend server to spin up (5 seconds)...
timeout /t 5 /nobreak > nul

echo [3/3] Running E2E integration test script...
python "%ROOT_DIR%verify_integration.py"
set "TEST_EXIT=!errorlevel!"

echo ===================================================
echo   Cleaning up background server...
echo ===================================================
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r ":8000.*LISTENING"') do (
    echo Killing process %%a listening on port 8000...
    taskkill /PID %%a /F > nul 2>&1
)

if !TEST_EXIT! equ 0 (
    echo [SUCCESS] Integration tests passed successfully!
) else (
    echo [FAIL] Integration tests failed.
)

exit /b !TEST_EXIT!
