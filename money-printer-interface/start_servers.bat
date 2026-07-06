@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   MoneyPrinterTurbo Interface Auto-Launcher
echo ===================================================

:: Define paths
set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"

echo [1/3] Checking backend virtual environment...
if not exist "%BACKEND_DIR%\.venv" (
    echo Virtual environment not found. Creating one...
    python -m venv "%BACKEND_DIR%\.venv"
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to create Python virtual environment.
        pause
        exit /b 1
    )
)

echo [2/3] Installing backend dependencies...
call "%BACKEND_DIR%\.venv\Scripts\activate.bat"
python -m pip install --upgrade pip
pip install -r "%BACKEND_DIR%\requirements.txt"
if !errorlevel! neq 0 (
    echo [ERROR] Failed to install backend requirements.
    pause
    exit /b 1
)

echo [3/3] Installing frontend dependencies...
cd /d "%FRONTEND_DIR%"
if not exist "node_modules" (
    echo Frontend node_modules not found. Running npm install...
    call npm install
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install frontend dependencies.
        pause
        exit /b 1
    )
) else (
    echo Frontend node_modules already exists. Skipping npm install.
)

echo ===================================================
echo   Starting Backend and Frontend concurrently...
echo ===================================================

:: Start backend in a new command prompt window
echo Starting FastAPI Backend on http://localhost:8000 ...
start "MoneyPrinterTurbo Backend" cmd /k "cd /d "%BACKEND_DIR%" && call .venv\Scripts\activate.bat && python main.py"

:: Start frontend in a new command prompt window
echo Starting Vite Frontend on http://localhost:5173 ...
start "MoneyPrinterTurbo Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

echo ===================================================
echo   Both servers have been launched!
echo   - Backend: http://localhost:8000
echo   - Frontend: http://localhost:5173
echo ===================================================
pause
