# DSH 聊天进度与公开思考翻译插件

源码与安装包：[ccawmiku/dsh-conversation-plugins](https://github.com/ccawmiku/dsh-conversation-plugins)（私有仓库）。两个插件独立安装、启用和卸载，不修改 DSH 核心。

| 插件 | 当前定位 |
| --- | --- |
| `dsh-reasoning-translation` **0.2.0** | 优先维护。将 DSH 已公开的 reasoning 翻译成聊天中的自然段落，作为进度体验的过渡方案 |
| `dsh-progress-commentary` 0.1.0 | 提示词引导主模型主动说明进度，不增加模型请求；不保证模型遵守 |

## 0.2.0 的变化

- **正文式展示**：去掉侧边框、卡片缩进、顶部模型名和整体灰化，使用 DSH 原生 Markdown、字体大小与主题颜色。译文逐步出现，仍与工具过程保持来源顺序。
- **轻量原文入口**：每段下方的小号“思考译文”可展开原文、服务商、模型与目标语言。翻译身份仍清楚可查。
- **没有翻译条数上限**：取消每轮调用上限、总源文本截断与队列满后丢弃片段。全部新片段顺序排队；旧 `maxCallsPerTurn`、`maxPending` 字段即使留在配置里也不会生效。
- **设置 → 思考翻译**：直接查看当前模型，从 DSH 已配置模型中选择；也可手动填写服务商路由与模型 ID。开关、模型和目标语言一次保存，新片段立即生效。
- 修复启用时路由未填就导致插件启动失败的问题。模型列表读取失败时仍能手动配置。

译文保持原意和不确定性，不会改写成虚构的任务进度，也不会加入主模型上下文。原文、工具参数和最终回答保持原样。

## 兼容范围

翻译插件清单接受 **DSH `0.2.1-rc.2` 或 `0.2.1-rc.3`**，Node ≥24.9.0。源码类型检查与集成测试固定在官方提交 `22ddee3792402c3e70ec5f86a63c3e3e895a2f60`（`0.2.1-rc.3`）；另对本机 DSH NEXT `2.0.19-next` 内置的 `0.2.1-rc.2` 核查了现有接口，桌面验收情况见 [验证记录](docs/VALIDATION.md)。同版本号的其他构建和后续版本仍需重验。

进度插件 0.1.0 的原清单保持 `0.2.1-rc.3`。不建议为安装而绕过官方版本检查。

DSH 官方实验“思考翻译”主要显示在展开的思考栏中。本项目提供任意已配置模型与聊天流显示。两者同时开启可能分别发送请求，通常选一种即可。

## 安装

当前安装包位于 `dist/`：

- `dsh-reasoning-translation-0.2.0.tgz`（推荐优先使用）
- `dsh-progress-commentary-0.1.0.tgz`

Web／CLI profile：

```sh
dsh plugin --profile web add /绝对路径/dsh-reasoning-translation-0.2.0.tgz
```

桌面版请使用 DSH 自带的插件管理器安装本地 `.tgz`，避免用另一套 npm DSH 混写桌面 profile。升级后重启 DSH，让 Host 和浏览器入口一起加载新版本。已有模型配置和历史译文保留；历史译文会直接采用新排版，**不会补译旧历史或重新发送已完成请求**。

首次安装默认关闭。进入 **设置 → 思考翻译**，选定模型后勾选启用并保存。插件详情仍可编辑相同的实时字段。若早期手工安装在 profile patch 的 `insert` 中又写入了同名翻译插件，请在已装配本包 bundle 的前提下，把这一条改为示例中的顶层 `id` 配置覆盖；否则 DSH 的标准设置编辑器可能拒绝保存。

## 翻译配置

模型下拉菜单来自 DSH 自身的模型目录，按服务商分组。未在目录中公开的自定义模型可手动填写 `provider`、`model`；填写的是 DSH 注册的路由名与模型 ID，不是 API 地址。插件复用现有凭证，没有 API key 字段，也不回显凭证。

```yaml
- id: dsh-reasoning-translation
  config:
    enabled: true
    provider: 已配置的服务商路由
    model: 翻译模型ID
    targetLanguage: 简体中文
    maxCharsPerCall: 1600
    timeoutMs: 45000
    maxOutputTokens: 4096
    maxOutputChars: 16000
```

| 字段 | 默认 | 含义 |
| --- | --- | --- |
| `enabled` | false | 启用后会向所选模型发送公开思考片段，产生额外模型请求和费用 |
| `provider`、`model` | 空 | 明确选择翻译路由，可不同于主模型，不自动切换服务商 |
| `targetLanguage` | 简体中文 | 目标语言 |
| `maxCharsPerCall` | 1600 | 单次源片段字符上限；长段落继续切分，不限制总段数 |
| `timeoutMs` | 45000 | 单次请求超时，不是播报定时器 |
| `maxOutputTokens` | 4096 | 单次模型输出 token 上限 |
| `maxOutputChars` | 16000 | 单次译文字符上限；超长或截断响应不标为成功 |

前四项在设置里实时保存，其余单次请求参数通过 profile patch 修改后重新加载。patch 替换整行 `config`，未写字段恢复默认，示例见 [examples](examples/)。**没有每轮翻译预算、片段条数或待处理数量上限。** 请求串行处理，翻译模型较慢时会积压；可通过关闭翻译取消待处理工作。主模型继续执行工具，不等待翻译。

配置改变后，已排队片段使用入队时的模型与语言，新片段使用新配置。关闭开关会取消在途和待处理翻译，保留已有历史。辅助费用不一定计入主回合 Token 面板，以服务商账单为准。

## 持久化、取消与失败

请求先记录来源位置并等待 Session flush，再发往模型。结果使用独立、可忽略的 `plugin:` 记录，刷新只重放显示，不进入 `deriveMessages()`，不会污染主模型输入。

辅助模型的普通文本可逐步显示为“翻译中”，只有完整成功响应才成为已完成译文。流式快照每 200ms 至多保存一次；失败、超时或取消会替换未完成文本的状态，迟到输出不会覆盖取消结果。只有请求或半成品的崩溃历史表示结果尚待确认，不自动重试。

超时、断网、截断响应、存储失败和翻译模型要求工具调用都不会冒充翻译成功。不会自动重试或切换服务商。取消主任务、关闭翻译、停用或卸载会停止本地待处理工作；若服务商忽略取消，远端仍可能完成计费。原文可随时展开，子 Agent 的译文保留在其自身 Session。

```sh
dsh plugin --profile web remove dsh-reasoning-translation
```

卸载不删除原文或历史插件记录。未来 DSH 格式迁移对实验记录仍只有尽力保留保证。

## 关于进度插件没有反应

它通过 `systemPrompt.context({ required: true })` 注入规则，不会把 reasoning 自动转成公开回复。当前本机会话中已确认规则存在，但最近几轮工具步骤没有普通文本，模型主要在最终回答才输出普通文本。因此单靠提示词不能保证 Codex 式播报。本轮保持该插件代码不变，优先翻译方案。

主模型若能交错生成普通文本和工具调用，DSH 可以显示；设置 → 通用 → 收起后显示的回复选“全部回复”可在任务完成后保留。只输出普通文本、没有工具调用的响应可能直接结束回合，插件不伪造工具或追加强制循环。

## 开发验证

```sh
# 官方 DSH checkout，按其说明准备依赖
# 固定提交：22ddee3792402c3e70ec5f86a63c3e3e895a2f60
pnpm install --ignore-scripts --frozen-lockfile
pnpm exec tsx scripts/generate-typert.ts
pnpm exec tsc -b vendor/loader packages/client/ui-chat/tsconfig.client.json --pretty false

# 本项目；设置 DSH_SOURCE 指向上述 checkout
npm ci --ignore-scripts
npm run check
```

PowerShell 设置路径示例：`$env:DSH_SOURCE='C:\path\to\deepseek-harness'`。未设置时使用 `../dsh-research/deepseek-harness`。

验证包含构建、真实上游 Host／Client 分离类型检查、安装包加载、Agent Loop、串行队列、流式重放、设置交互与安全 Markdown。详情与实测限制见 [验证记录](docs/VALIDATION.md)；早期架构研究见 [RESEARCH](docs/RESEARCH.md)。
