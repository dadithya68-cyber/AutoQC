@echo off
echo ======================================================================
echo   🚗 APEX MOTORS QUALITY ASSURANCE & DEFECT TELEMETRY PLATFORM
echo ======================================================================
echo Starting Backend API (Port 5000) and Frontend Vite (Port 5173)...
echo.

start "Apex QA - Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul
start "Apex QA - Frontend App" cmd /k "cd frontend && npm run dev"

echo Services launched!
echo - Frontend Dashboard: http://localhost:5173
echo - Backend REST API:   http://localhost:5000
echo - WebSocket Stream:   ws://localhost:5000/ws
echo ======================================================================
