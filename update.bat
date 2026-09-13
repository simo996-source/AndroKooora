@echo off
cd /d "%~dp0"

git add -A

git diff --cached --quiet
if %errorlevel% neq 0 (
    echo Changes detected - committing and pushing...
    git commit -m "Website update: %date% %time%"
    git push
    echo Done! Netlify will redeploy automatically.
) else (
    echo No changes detected. Nothing to push.
)

pause
