@echo off
rem Поклади sd_worker.py і worker.json у папку Forge Neo й запускай цей файл звідти.
chcp 65001 >nul
if exist venv\Scripts\python.exe (venv\Scripts\python.exe sd_worker.py) else (python sd_worker.py)
pause
