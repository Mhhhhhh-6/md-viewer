# Trellis 最佳实践指南

> Trellis 是一个多平台 AI 编程框架，通过规范注入、任务管理、并行开发和项目记忆来提升 AI 辅助编程的效率和质量。

## 目录

- [1. 安装与初始化](#1-安装与初始化)
- [2. 核心概念](#2-核心概念)
- [3. 目录结构详解](#3-目录结构详解)
- [4. Spec 规范系统最佳实践](#4-spec-规范系统最佳实践)
- [5. 任务管理最佳实践](#5-任务管理最佳实践)
- [6. 工作流最佳实践](#6-工作流最佳实践)
- [7. 多代理并行开发](#7-多代理并行开发)
- [8. 命令参考](#8-命令参考)
- [9. 团队协作最佳实践](#9-团队协作最佳实践)
- [10. 常见问题与解决方案](#10-常见问题与解决方案)

---

## 1. 安装与初始化

### 环境要求

- Node.js >= 18
- Python >= 3.8（脚本运行需要）
- Git（任务和并行开发需要）

### 安装

```bash
npm install -g @mindfoldhq/trellis@latest
```

### 初始化项目

```bash
# 基本初始化（Claude Code 平台）
trellis init -u your-name

# 指定多个平台
trellis init --claude --cursor -u your-name

# 非交互模式（CI/自动化环境）
trellis init -u your-name --claude -y

# 使用远程模板
trellis init -u your-name -t electron-fullstack
```

**最佳实践：**
- `-u` 参数使用真实用户名，它会创建个人工作区用于会话记忆
- 团队项目中，每个成员用自己的用户名执行 `trellis init -u name`
- 将 `.trellis/` 目录提交到版本控制，但个人 workspace 可按需 gitignore

### 平台支持

| 平台 | 命令 | 自动注入 | 多代理 |
|------|------|----------|--------|
| Claude Code | `trellis init --claude` | 支持（Hook） | 支持 |
| Cursor | `trellis init --cursor` | 需手动 `/start` | 不支持 |
| Codex | `trellis init --codex` | 通过 AGENTS.md | 不支持 |
| OpenCode | `trellis init --opencode` | 支持（Hook） | 不支持 |
| Kilo | `trellis init --kilo` | 自动加载 rules | 不支持 |
| Kiro | `trellis init --kiro` | 自动加载 steering | 不支持 |

---

## 2. 核心概念

### 2.1 Spec（规范）

存放在 `.trellis/spec/` 中的 Markdown 文件，定义项目的编码标准、架构约定和质量规则。AI 在每次任务中会自动加载相关规范。

### 2.2 Task（任务）

存放在 `.trellis/tasks/` 中的结构化任务单元，包含 PRD（产品需求文档）、实现上下文和检查清单。

### 2.3 Workspace（工作区）

存放在 `.trellis/workspace/` 中的个人日志和会话记录，让 AI 能在新会话中延续之前的上下文。

### 2.4 Ralph Loop（质量循环）

Claude Code 独有的自动验证机制，在任务完成前自动运行检查（lint、类型检查、测试等），防止低质量代码提交。

### 2.5 六代理流水线

| 代理 | 职责 | 约束 |
|------|------|------|
| dispatch | 编排调度 | 只读，不访问 spec |
| plan | 需求验证 | 可拒绝不清晰的需求 |
| implement | 代码生成 | 不能直接 git commit |
| check | 质量保障 | 通过 Ralph Loop 自我修复 |
| debug | 定向修复 | 仅精准修复 |
| research | 信息收集 | 只读模式 |

---

## 3. 目录结构详解

```
.trellis/
├── spec/                          # 项目规范（团队共享）
│   ├── backend/                   # 后端规范
│   │   ├── index.md              # 后端规范索引
│   │   ├── database-guidelines.md # 数据库操作规范
│   │   ├── error-handling.md     # 错误处理规范
│   │   └── logging-guidelines.md # 日志规范
│   ├── frontend/                  # 前端规范
│   │   ├── index.md              # 前端规范索引
│   │   ├── component-guidelines.md
│   │   ├── hook-guidelines.md
│   │   └── state-management.md
│   └── guides/                    # 通用思维指南
│       ├── cross-layer-thinking-guide.md
│       └── code-reuse-thinking-guide.md
├── tasks/                         # 任务管理
│   └── 00-bootstrap-guidelines/   # 示例任务
│       └── prd.md
├── workspace/                     # 个人工作区（按开发者隔离）
│   └── your-name/
│       └── journal.md
├── scripts/                       # 自动化脚本
├── config.yaml                    # 项目配置
└── workflow.md                    # 共享工作流规则

.claude/                           # Claude Code 专用
├── agents/                        # 六个代理定义
├── commands/trellis/              # Slash 命令
├── hooks/                         # 自动注入钩子
│   ├── session-start.py          # 会话启动注入
│   ├── inject-subagent-context.py # 子代理上下文注入
│   └── ralph-loop.py             # 质量循环检查
└── settings.json                  # Claude Code 配置
```

---

## 4. Spec 规范系统最佳实践

### 4.1 从现有代码生成初始规范

不要从零开始写规范。让 AI 先分析现有代码，然后人工审核和调整。

```
# 在 Claude Code 中
> 分析 src/ 目录的代码风格、命名规范和架构模式，
  然后更新 .trellis/spec/ 中的对应规范文件
```

### 4.2 规范文件的组织原则

- **按职责分层**：`spec/backend/`、`spec/frontend/`、`spec/guides/`
- **每个目录有 index.md**：作为该层规范的入口和概述
- **规范要具体可执行**：不写"代码要简洁"，而写"函数不超过 50 行，单个文件不超过 300 行"
- **包含正反示例**：

```markdown
## 错误处理规范

### 正确示例
​```typescript
try {
  const user = await userService.findById(id);
  if (!user) throw new NotFoundException('User not found');
  return user;
} catch (error) {
  logger.error('Failed to find user', { userId: id, error });
  throw error;
}
​```

### 错误示例
​```typescript
// 不要吞掉错误
try {
  const user = await userService.findById(id);
  return user;
} catch (e) {
  return null; // 隐藏了问题
}
​```
```

### 4.3 规范的迭代优化

当发现 AI 反复犯同样的错误时，立即将修正规则写入 spec：

```bash
# 使用内置命令更新规范
/trellis:update-spec
```

**最佳实践：** 每次 code review 发现的共性问题都应沉淀为 spec 规则。

### 4.4 JSONL 上下文配置

为不同代理配置精准的上下文注入文件：

```jsonl
{"file": ".trellis/spec/backend/error-handling.md", "reason": "错误处理规范", "type": "file"}
{"file": "src/shared/types/", "reason": "共享类型定义", "type": "directory"}
```

- `implement.jsonl`：代码生成需要的上下文
- `check.jsonl`：质量检查需要的标准
- `debug.jsonl`：调试需要的背景信息

---

## 5. 任务管理最佳实践

### 5.1 任务目录结构

```
.trellis/tasks/
└── 01-user-authentication/
    ├── prd.md              # 产品需求文档
    ├── implement.jsonl     # 实现上下文
    ├── check.jsonl         # 检查上下文
    └── debug.jsonl         # 调试上下文
```

### 5.2 编写高质量 PRD

一个好的 PRD 应该包含：

```markdown
# 用户认证功能

## 目标
实现基于 JWT 的用户注册和登录功能。

## 需求
1. 用户可通过邮箱+密码注册
2. 注册时验证邮箱唯一性
3. 登录返回 JWT token
4. Token 有效期 7 天

## 技术约束
- 使用 bcrypt 加密密码（rounds=12）
- JWT 密钥从环境变量读取
- 遵循 RESTful API 设计

## 验收标准
- [ ] 注册接口返回 201
- [ ] 重复邮箱注册返回 409
- [ ] 登录成功返回 token
- [ ] 无效凭据返回 401
- [ ] 所有端点有单元测试
```

### 5.3 任务粒度控制

- **单个任务控制在 30 分钟以内可完成**
- 大功能拆分为多个子任务
- 使用 `/trellis:parallel` 并行执行独立子任务
- Plan 代理会自动拒绝过大的任务并建议拆分

---

## 6. 工作流最佳实践

### 6.1 标准开发流程

```
1. /trellis:start           → 初始化会话，注入上下文
2. 描述需求                  → AI 分析并创建/选取任务
3. /trellis:before-*-dev    → 加载对应层的规范
4. AI 实现代码               → implement 代理执行
5. /trellis:check-*         → 质量检查（自动 Ralph Loop）
6. /trellis:check-cross-layer → 跨层验证
7. /trellis:finish-work     → 提交前最终检查
8. /trellis:record-session  → 记录会话日志
```

### 6.2 开始每个会话

在 Claude Code 中，Hook 会自动注入上下文。但手动触发可以确保完整的上下文加载：

```
/trellis:start
```

这会：
- 读取工作流规范
- 加载当前任务上下文
- 检查上次会话的日志
- 分类任务类型（问答 / 快速修复 / 完整开发）

### 6.3 Bug 调试工作流

```
/trellis:break-loop
```

使用五维分析框架：
1. **症状分析** - 现象是什么
2. **根因定位** - 根本原因是什么
3. **修复方案** - 怎么修
4. **预防措施** - 怎么防止再犯（更新 spec）
5. **验证确认** - 怎么验证修好了

**最佳实践：** 每次修复 bug 后考虑是否需要更新 spec 来预防类似问题。

### 6.4 会话记录

每次开发完毕后：

```
/trellis:record-session
```

这会将本次会话的关键决策、代码变更、遇到的问题记录到 `workspace/your-name/journal.md`，供后续会话参考。

---

## 7. 多代理并行开发

### 7.1 何时使用并行开发

- 多个独立功能可以同时进行
- 预计总工作量超过 30 分钟
- 功能之间没有强依赖关系

### 7.2 启动并行开发

```
/trellis:parallel
```

这会：
1. 分析任务，拆分子任务
2. 为每个子任务创建 git worktree
3. 分配独立的代理执行
4. 监控各任务进度

### 7.3 worktree.yaml 配置

```yaml
# .trellis/config 中的 worktree 配置
worktree:
  location: "../.worktrees"          # worktree 存储位置
  copy_files:                         # 每个 worktree 需要独立副本的文件
    - .env
    - .developer
  post_create:                        # 创建后执行的安装步骤
    - npm install
  verify:                             # 质量门禁命令
    - npm run lint
    - npm run typecheck
    - npm run test
```

### 7.4 并行开发注意事项

- 确保子任务之间没有文件级别的冲突
- 数据库 migration 不要并行执行
- 每个 worktree 有独立的 `.env`，避免端口冲突
- 合并时按依赖顺序逐个合入主分支

---

## 8. 命令参考

### 会话管理

| 命令 | 用途 |
|------|------|
| `/trellis:start` | 初始化会话，加载上下文 |
| `/trellis:parallel` | 启动多代理并行开发 |
| `/trellis:record-session` | 记录会话日志到 workspace |

### 开发准备

| 命令 | 用途 |
|------|------|
| `/trellis:before-backend-dev` | 加载后端规范 |
| `/trellis:before-frontend-dev` | 加载前端规范 |

### 质量保障

| 命令 | 用途 |
|------|------|
| `/trellis:check-backend` | 后端代码质量检查 |
| `/trellis:check-frontend` | 前端代码质量检查 |
| `/trellis:check-cross-layer` | 跨层数据流验证 |
| `/trellis:finish-work` | 提交前最终检查 |

### 知识与工具

| 命令 | 用途 |
|------|------|
| `/trellis:break-loop` | 五维 bug 分析 |
| `/trellis:brainstorm` | 协作式头脑风暴 |
| `/trellis:onboard` | 新成员培训（含5个实操练习） |
| `/trellis:create-command` | 创建自定义命令 |
| `/trellis:update-spec` | 更新项目规范 |

---

## 9. 团队协作最佳实践

### 9.1 版本控制策略

```gitignore
# .trellis/.gitignore 建议
# 保留这些（团队共享）
# .trellis/spec/
# .trellis/tasks/
# .trellis/workflow.md
# .trellis/config.yaml

# 忽略这些（个人或临时）
.trellis/workspace/*/         # 个人日志
.trellis/.current-task        # 当前任务状态
```

### 9.2 Spec 的团队协作

1. **Spec 变更走 PR 流程**：规范的变更和代码一样需要 review
2. **指定 Spec Owner**：每个 spec 文件有明确的负责人
3. **定期 Spec Review**：每 2 周检查一次 spec 是否还和实际代码一致
4. **新人入职用 `/trellis:onboard`**：系统化了解项目规范

### 9.3 任务协作

- 每个任务分配明确的开发者
- PRD 写完后让团队 review 再开始实现
- 用 `/trellis:record-session` 保证交接时有上下文

---

## 10. 常见问题与解决方案

### Q: AI 忽略了我的 spec 规则怎么办？

检查以下几点：
1. 规则是否写在正确的 spec 文件中
2. 对应的 JSONL 配置是否引用了该 spec 文件
3. 规则是否足够具体（避免模糊的描述）
4. 尝试在规则中加入正反示例

### Q: Ralph Loop 检查一直失败怎么办？

1. 检查 `worktree.yaml` 中的 verify 命令是否正确
2. 确认测试环境配置（数据库、环境变量等）
3. Ralph Loop 最多迭代 5 次，超时 30 分钟后会停止
4. 可以手动修复后重新触发检查

### Q: 非交互环境下初始化失败？

使用 `-y` 参数跳过交互提示：

```bash
trellis init -u your-name --claude -y
```

### Q: 如何升级 Trellis？

```bash
# 升级全局包
npm install -g @mindfoldhq/trellis@latest

# 在项目中更新模板文件
trellis update
```

`trellis update` 支持后台监听模式，自动检测模板更新。

### Q: 如何创建自定义命令？

```
/trellis:create-command
```

这会同时为 Claude Code（`.claude/commands/`）和 Cursor（`.cursor/commands/`）生成命令文件。

### Q: 如何为全新项目（Greenfield）使用 Trellis？

1. `trellis init -u your-name` 生成脚手架
2. 先填写核心 spec：技术栈选型、目录结构、命名规范
3. 用 `/trellis:start` 开始第一个任务
4. 随着项目成长持续迭代 spec

---

## 附录：快速上手检查清单

- [ ] 安装 Trellis：`npm install -g @mindfoldhq/trellis@latest`
- [ ] 在项目根目录初始化：`trellis init -u your-name --claude -y`
- [ ] 检查 `.trellis/spec/` 目录，根据项目实际情况修改规范
- [ ] 配置 `worktree.yaml` 中的 verify 命令（lint、test 等）
- [ ] 用 `/trellis:start` 开始第一次会话
- [ ] 开发完毕用 `/trellis:record-session` 记录会话
- [ ] 将 `.trellis/` 提交到 git（注意 gitignore 个人文件）
