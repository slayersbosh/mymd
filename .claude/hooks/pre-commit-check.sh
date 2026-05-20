#!/usr/bin/env bash
# pre-commit-check Hook
# 每次 commit 前自动跑编译检查，编译不过阻止提交

set -e

echo "[Hook] pre-commit-check running..."

# 编译检查
echo "[Hook] Running TypeScript check..."
npx tsc --noEmit --project tsconfig.json || {
    echo "[Hook] ❌ TypeScript check failed — commit blocked"
    exit 1
}

# ESLint 检查
echo "[Hook] Running ESLint..."
npx eslint src --max-warnings 0 || {
    echo "[Hook] ❌ ESLint failed — commit blocked"
    exit 1
}

# 单元测试（如果存在）
if [ -f "vitest.config.ts" ] || [ -f "jest.config.js" ]; then
    echo "[Hook] Running unit tests..."
    npx vitest run --reporter=basic || {
        echo "[Hook] ❌ Tests failed — commit blocked"
        exit 1
    }
fi

echo "[Hook] ✅ All checks passed"
