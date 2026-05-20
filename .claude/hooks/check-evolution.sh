#!/usr/bin/env bash
# check-evolution Hook
# 每次新开 session 时检查 feedback 积累，有待处理的就提醒

FEEDBACK_INDEX="$HOME/.hermes/agent-harness/projects/.claude/feedback/FEEDBACK-INDEX.md"
EVOLUTION_FILE="$HOME/.hermes/agent-harness/projects/.claude/EVOLUTION.md"

if [ ! -f "$FEEDBACK_INDEX" ]; then
    echo "[Hook] check-evolution: No feedback history found"
    exit 0
fi

PENDING=$(grep -c "status: pending" "$FEEDBACK_INDEX" 2>/dev/null || echo "0")

if [ "$PENDING" -gt 0 ]; then
    echo "[Hook] ⚠️ check-evolution: $PENDING pending feedback item(s)"
    echo "[Hook] Run /evolve to review evolution suggestions"
else
    echo "[Hook] check-evolution: No pending items"
fi
