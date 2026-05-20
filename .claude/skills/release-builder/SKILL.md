---
name: release-builder
description: 构建发布 — 打包 + 部署 + 上线检查
trigger: 当前 Phase 所有 Task + Review 通过后触发
prerequisite: 所有 Task Review 通过
category: agent-harness/skills
---

# release-builder

## 目的

一个 Phase 开发完成后，执行构建、打包、部署流程，确保可发布状态。

## 执行流程

### Step 1: 构建前检查

```
检查清单：
- [ ] 所有 Task 完成
- [ ] 所有 Review 通过
- [ ] 编译通过（生产构建）
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 没有未解决的 HIGH priority issues
```

### Step 2: 生产构建

```bash
# 前端项目
npm run build

# 验证构建产物
ls -la dist/

# 检查产物大小（异常大说明可能有调试代码）
```

### Step 3: 环境配置

```
生产环境配置检查：
- [ ] 环境变量正确（无硬编码密钥）
- [ ] API 端点指向生产环境
- [ ] 日志级别正确（不是 debug）
- [ ] 监控/告警已配置
```

### Step 4: 部署

根据部署方式执行：

```bash
# Docker
docker build -t app:latest .
docker push registry/app:latest

# K8s
kubectl apply -f k8s/production.yaml

# Vercel/Netlify
vercel --prod

# 手动部署
rsync -avz dist/ user@server:/var/www/app/
```

### Step 5: 上线检查

```
健康检查：
- [ ] 服务启动成功
- [ ] 首页可访问
- [ ] 核心功能可使用
- [ ] 无控制台错误
- [ ] 监控仪表盘正常
- [ ] 日志无异常 ERROR
```

### Step 6: 发布记录

```markdown
# Release Notes — Phase-N

## 发布版本
v0.N.0

## 发布内容
- [ ] 功能 A
- [ ] 功能 B

## 变更文件
- src/pages/A.tsx
- src/api/b.ts

## 上线验证
- [x] 2024-01-01 10:00 服务启动
- [x] 2024-01-01 10:05 核心功能验证
```

## 回滚流程

如果上线检查失败：

```
1. 立即回滚到上一版本
git revert HEAD
git push

2. 记录事故报告
- 时间
- 问题描述
- 影响的用户
- 修复措施

3. 分析根因（调用 bug-fixer）
```

## 与其他 Skill 的关系

- 是 Phase 结束的最后一个 Skill
- 成功完成后更新 PROJECT_STATE.md
- 失败时触发 bug-fixer 进行 hotfix
