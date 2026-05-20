#!/usr/bin/env bash
# mark-review-needed Hook
# 代码文件被编辑或创建后，自动标记为"需要 review"

TRIGGER_EXTENSIONS="ts tsx js jsx py go rs"

for ext in $TRIGGER_EXTENSIONS; do
    if git diff --cached --name-only | grep -qE "\.$ext$"; then
        echo "[Hook] mark-review-needed: Source files detected in commit"
        echo "[Hook] Files will be reviewed by code-reviewer before merge"
        break
    fi
done
