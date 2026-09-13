@echo off
rem 세션이 끝나도 사진 생성이 계속 돌도록 따로 띄운다.
rem   scripts\run-photos.bat
rem 로그는 scripts\_photos.log 에 쌓인다.

cd /d "%~dp0.."
echo [%date% %time%] 시작 >> "scripts\_photos.log"
node "scripts\gen-photos.js" >> "scripts\_photos.log" 2>&1
echo [%date% %time%] 원본 끝 — 오려내기 시작 >> "scripts\_photos.log"
node "scripts\crop-photos.js" >> "scripts\_photos.log" 2>&1
echo [%date% %time%] 모두 끝 >> "scripts\_photos.log"
