@echo off
rem SD worker: downloads and updates itself, then starts. Put ONLY this file into the Forge Neo folder and run it.
cd /d "%~dp0"
title SD worker

echo [1/3] Checking worker update ...
powershell -NoProfile -Command "$ErrorActionPreference='Stop'; $u=@('https://zbyrai.pages.dev/sd-remote/worker/sd_worker.py','https://raw.githubusercontent.com/foonyresso/zbyrai/main/sd-remote/worker/sd_worker.py'); foreach($x in $u){ try { Invoke-WebRequest -UseBasicParsing $x -OutFile 'sd_worker.new'; if ((Get-Content 'sd_worker.new' -Raw) -match 'def main') { exit 0 } } catch {} }; exit 1"
if errorlevel 1 (
  echo       Update skipped ^(no internet or file unavailable^).
  if exist sd_worker.new del sd_worker.new
  if not exist sd_worker.py (
    echo ERROR: sd_worker.py is missing and could not be downloaded. Check internet and try again.
    pause
    exit /b 1
  )
) else (
  move /y sd_worker.new sd_worker.py >nul
  echo       Worker is up to date.
)

echo [2/3] Checking worker.json ...
if not exist worker.json (
  echo       worker.json not found, downloading a template ...
  powershell -NoProfile -Command "$ErrorActionPreference='Stop'; foreach($x in @('https://zbyrai.pages.dev/sd-remote/worker/worker.example.json','https://raw.githubusercontent.com/foonyresso/zbyrai/main/sd-remote/worker/worker.example.json')){ try { Invoke-WebRequest -UseBasicParsing $x -OutFile 'worker.json'; exit 0 } catch {} }; exit 1"
  if errorlevel 1 (
    echo ERROR: could not download worker.json template.
    pause
    exit /b 1
  )
  echo       Put your WORKER_TOKEN into worker.json ^(the line with "token"^), save it and close Notepad.
  notepad worker.json
)

echo [3/3] Starting worker ...
if exist "venv\Scripts\python.exe" (
  "venv\Scripts\python.exe" sd_worker.py
) else (
  python sd_worker.py
)
echo.
echo Worker stopped. Press any key to close.
pause >nul
exit /b 0
