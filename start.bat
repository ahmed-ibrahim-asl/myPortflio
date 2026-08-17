@echo off
setlocal EnableDelayedExpansion
title Ahmed Asl — Portfolio Launcher

:: ──────────────────────────────────────────────────────────────────────────────
:: Colour helpers  (ANSI – works in Windows 10 v1511+ / Windows Terminal)
:: ──────────────────────────────────────────────────────────────────────────────
for /f %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "CYAN=%ESC%[36m"
set "GREEN=%ESC%[32m"
set "YELLOW=%ESC%[33m"
set "RED=%ESC%[31m"
set "BOLD=%ESC%[1m"
set "RESET=%ESC%[0m"

:: ──────────────────────────────────────────────────────────────────────────────
:: Banner
:: ──────────────────────────────────────────────────────────────────────────────
cls
echo.
echo %BOLD%%CYAN%  ╔══════════════════════════════════════════════════╗%RESET%
echo %BOLD%%CYAN%  ║        Ahmed Asl — Portfolio Launcher            ║%RESET%
echo %BOLD%%CYAN%  ╚══════════════════════════════════════════════════╝%RESET%
echo.

:: ──────────────────────────────────────────────────────────────────────────────
:: Verify Node / npm are available
:: ──────────────────────────────────────────────────────────────────────────────
where node >nul 2>&1 || (
    echo %RED%  [ERROR] Node.js was not found. Please install it from https://nodejs.org%RESET%
    pause
    exit /b 1
)
where npm >nul 2>&1 || (
    echo %RED%  [ERROR] npm was not found. Make sure Node.js is properly installed.%RESET%
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node --version 2^>nul') do set "NODE_VER=%%v"
for /f "tokens=*" %%v in ('npm --version 2^>nul')  do set "NPM_VER=%%v"
echo %GREEN%  Node  %NODE_VER%    npm  %NPM_VER%%RESET%
echo.

:: ──────────────────────────────────────────────────────────────────────────────
:: Install dependencies if node_modules is missing
:: ──────────────────────────────────────────────────────────────────────────────
if not exist "%~dp0node_modules\" (
    echo %YELLOW%  node_modules not found — running npm ci ...%RESET%
    echo.
    cd /d "%~dp0"
    call npm ci
    if errorlevel 1 (
        echo %RED%  [ERROR] npm ci failed. Check your network or package-lock.json.%RESET%
        pause
        exit /b 1
    )
    echo.
    echo %GREEN%  Dependencies installed successfully.%RESET%
    echo.
)

cd /d "%~dp0"

:: ──────────────────────────────────────────────────────────────────────────────
:: Menu
:: ──────────────────────────────────────────────────────────────────────────────
:MENU
echo %BOLD%  What would you like to run?%RESET%
echo.
echo %CYAN%  [1]%RESET%  Next.js dev server       %YELLOW%(http://localhost:3000)%RESET%
echo %CYAN%  [2]%RESET%  Portfolio Studio         %YELLOW%(http://localhost:4173)%RESET%
echo %CYAN%  [3]%RESET%  Both at once             %YELLOW%(dev + studio in separate windows)%RESET%
echo %CYAN%  [4]%RESET%  Validate content
echo %CYAN%  [5]%RESET%  Build for production
echo %CYAN%  [Q]%RESET%  Quit
echo.
set /p "CHOICE=  Enter your choice: "

if /i "%CHOICE%"=="1" goto RUN_DEV
if /i "%CHOICE%"=="2" goto RUN_STUDIO
if /i "%CHOICE%"=="3" goto RUN_BOTH
if /i "%CHOICE%"=="4" goto RUN_VALIDATE
if /i "%CHOICE%"=="5" goto RUN_BUILD
if /i "%CHOICE%"=="q" goto QUIT
if /i "%CHOICE%"=="Q" goto QUIT

echo.
echo %RED%  Invalid choice. Please try again.%RESET%
echo.
goto MENU

:: ──────────────────────────────────────────────────────────────────────────────
:: Option 1 — Dev server
:: ──────────────────────────────────────────────────────────────────────────────
:RUN_DEV
echo.
echo %GREEN%  Starting Next.js dev server on http://localhost:3000 ...%RESET%
echo %YELLOW%  Press Ctrl+C to stop.%RESET%
echo.
npm run dev
goto END

:: ──────────────────────────────────────────────────────────────────────────────
:: Option 2 — Portfolio Studio
:: ──────────────────────────────────────────────────────────────────────────────
:RUN_STUDIO
echo.
echo %GREEN%  Starting Portfolio Studio on http://localhost:4173 ...%RESET%
echo %YELLOW%  Press Ctrl+C to stop.%RESET%
echo.
npm run studio
goto END

:: ──────────────────────────────────────────────────────────────────────────────
:: Option 3 — Both
:: ──────────────────────────────────────────────────────────────────────────────
:RUN_BOTH
echo.
echo %GREEN%  Launching Next.js dev server and Portfolio Studio in separate windows ...%RESET%
echo.
start "Portfolio - Dev Server (http://localhost:3000)" cmd /k "cd /d "%~dp0" && npm run dev"
timeout /t 2 /nobreak >nul
start "Portfolio - Studio (http://localhost:4173)" cmd /k "cd /d "%~dp0" && npm run studio"
echo %GREEN%  Both processes started.%RESET%
echo.
echo   Dev server  -^> %YELLOW%http://localhost:3000%RESET%
echo   Studio      -^> %YELLOW%http://localhost:4173%RESET%
echo.
echo   Close the separate windows to stop each process.
echo.
pause
goto END

:: ──────────────────────────────────────────────────────────────────────────────
:: Option 4 — Validate content
:: ──────────────────────────────────────────────────────────────────────────────
:RUN_VALIDATE
echo.
echo %GREEN%  Validating content ...%RESET%
echo.
npm run validate:content
echo.
if errorlevel 1 (
    echo %RED%  Validation found issues. See output above.%RESET%
) else (
    echo %GREEN%  All content is valid.%RESET%
)
echo.
pause
goto MENU

:: ──────────────────────────────────────────────────────────────────────────────
:: Option 5 — Production build
:: ──────────────────────────────────────────────────────────────────────────────
:RUN_BUILD
echo.
echo %GREEN%  Building for production ...%RESET%
echo %YELLOW%  Static output will be written to the "out" folder.%RESET%
echo.
npm run build
echo.
if errorlevel 1 (
    echo %RED%  Build failed. Check the output above for errors.%RESET%
) else (
    echo %GREEN%  Build succeeded! Static files are in the "out" folder.%RESET%
)
echo.
pause
goto MENU

:: ──────────────────────────────────────────────────────────────────────────────
:QUIT
echo.
echo %CYAN%  Goodbye!%RESET%
echo.

:END
endlocal
