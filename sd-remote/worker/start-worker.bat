@echo off
rem Put sd_worker.py and worker.json next to this file (Forge Neo folder).
cd /d "%~dp0"
title SD worker
if exist "venv\Scripts\python.exe" (
  "venv\Scripts\python.exe" sd_worker.py
) else (
  python sd_worker.py
)
echo.
echo Worker stopped. Press any key to close.
pause >nul
