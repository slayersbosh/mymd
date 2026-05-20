# Feedback Index

> 所有经验教训的索引。evolution-runner 扫描此文件生成进化建议。

## 索引

| 日期 | 来源 | 摘要 | 状态 | 出现次数 |
|------|------|------|------|----------|
| — | — | — | — | — |

## 来源说明

- `explicit`: 用户通过 `/feedback` 主动记录
- `detect-feedback-signal`: Hook 自动检测到修正关键词
- `code-review`: Review 过程中发现的反复问题

## 状态说明

- `pending`: 待处理
- `approved`: 已确认，待执行
- `done`: 已写入 Skill
- `rejected`: 已拒绝

## 扫描规则

同一条 feedback（相似内容）出现 **3 次以上** → 触发 Layer 2 进化提议
