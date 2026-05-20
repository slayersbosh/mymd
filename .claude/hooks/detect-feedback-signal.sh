#!/usr/bin/env bash
# detect-feedback-signal Hook
# 自动检测用户消息中的修正/不满关键词，提醒记录反馈

FEEDBACK_SIGNALS=(
    "你搞错了"
    "不是这样"
    "你又忘了"
    "不对"
    "错"
    "重新"
    "改了"
    "不对"
    "不是我说的"
    "bug"
    "有问题"
    "不行"
    "失败"
)

DETECTED=false

# 从 stdin 读取用户消息
while IFS= read -r line; do
    for signal in "${FEEDBACK_SIGNALS[@]}"; do
        if echo "$line" | grep -q "$signal"; then
            echo "[Hook] ⚠️ detect-feedback-signal: Detected '$signal' in message"
            DETECTED=true
            break 2
        fi
    done
done

if [ "$DETECTED" = true ]; then
    echo "[Hook] detect-feedback-signal: Suggesting to log feedback"
    echo "Use /feedback <修正内容> to record"
fi
