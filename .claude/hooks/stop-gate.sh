#!/usr/bin/env bash
# stop-gate Hook
# Agent 准备停下来时检查：代码改了但还没做 code review？不许停

set -e

FEEDBACK_DIR="$HOME/.hermes/agent-harness/projects/.claude/feedback"

# 检查是否有标记为待审查但还未审查的文件
if git diff --cached --name-only | grep -q "\.tsx?$"; then
    UNREVIEWED=$(git diff --cached --name-only | grep -E '\.(ts|tsx|js|jsx)$' | wc -l)
    if [ "$UNREVIEWED" -gt 0 ]; then
        echo "[Hook] ⚠️ stop-gate: $UNREVIEWED file(s) staged but review may not be complete"
        echo "[Hook] Please ensure code-review has passed before stopping"
    fi
fi

# 检查工作区是否有未提交的文件
if [ -n "$(git status --porcelain)" ]; then
    echo "[Hook] ⚠️ stop-gate: Uncommitted changes detected"
    echo "[Hook] Either commit them or stash before stopping"
    exit 1
fi

echo "[Hook] ✅ stop-gate: Clear to stop"
