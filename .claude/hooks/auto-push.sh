#!/usr/bin/env bash
# auto-push Hook
# commit 成功后自动推送到远程仓库

set -e

BRANCH=$(git rev-parse --abbrev-ref HEAD)
REMOTE=$(git remote get-url origin 2>/dev/null || echo "")

if [ -z "$REMOTE" ]; then
    echo "[Hook] auto-push: No remote configured, skipping push"
    exit 0
fi

echo "[Hook] auto-push: Pushing to origin/$BRANCH..."
git push origin "$BRANCH" || {
    echo "[Hook] ❌ Push failed"
    exit 1
}

echo "[Hook] ✅ Pushed to origin/$BRANCH"
