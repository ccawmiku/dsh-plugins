# DSH 聊天进度与公开思考翻译插件

GitHub 仓库：[ccawmiku/dsh-conversation-plugins](https://github.com/ccawmiku/dsh-conversation-plugins)（私有）。

本项目交付两个可以分别安装、启用和移除的插件，源码、文档和预构建安装包均保存在本仓库；没有修改 DeepSeek Harness 核心，也没有调用真实模型 API。

| 插件 | 做什么 | 额外模型请求 |
| --- | --- | --- |
| `dsh-progress-commentary` | 用 Codex 公开规则引导主模型在复杂任务中主动说明发现与下一步，通过现有聊天流显示 | **不增加**，也不调用第二模型 |
| `dsh-reasoning-translation` | 把 DSH 已公开输出的 reasoning 片段交给指定的另一模型翻译，在聊天流显示带来源的译文 | **会增加**，有队列、次数、长度与超时限制 |

翻译和主模型进度是两种内容。译文不会被伪装成主模型进度，也不会加入主模型的输入；原文、工具参数和最终回答保持原样。

## 兼容范围：安装前先看

验证基线是官方 DSH `master` 的 **`22ddee3792402c3e70ec5f86a63c3e3e895a2f60`**，其源码包版本为 **`0.2.1-rc.3`**，Node 至少 `24.9.0`。2026-10-23 本次检查时，npm 上 `@deepseek-ai/dsh-llm` 的 latest 仍是 `0.0.1-rc.1`。本项目没有声称兼容该旧版桌面程序或所有未来版本；安装清单故意要求精确 DSH 版本，避免静默加载不兼容 API。

**不要为了安装而跳过 DSH 的版本检查。** 若你现在使用 npm 旧版，请等待对应发行版，或使用上述官方提交构建的 DSH；无需维护私有 Fork。相同版本号但不同提交也需要重新验收，尤其是翻译插件用到的实验性记录接口。

已有的 DSH 官方实验“思考翻译”主要在展开的思考栏中工作，并支持 Bing、Google 与限定的 DeepSeek Flash 路由。本项目新增的是**可配置 DSH 模型＋聊天流译文**，不替换或破坏那个官方功能。两者同时开启会产生各自的翻译请求；通常选择一种即可。

## 获取与安装

已经构建好的安装包位于 `dist/`：

- `dsh-progress-commentary-0.1.0.tgz`
- `dsh-reasoning-translation-0.1.0.tgz`

将两个文件下载到运行 DSH 的电脑。以下 `/绝对路径/` 必须替换为该电脑上的实际路径，不是云端工作区路径。

### Web／CLI profile

在符合兼容范围的 DSH 环境执行：

```sh
dsh plugin --profile web add /绝对路径/dsh-progress-commentary-0.1.0.tgz
dsh plugin --profile web add /绝对路径/dsh-reasoning-translation-0.1.0.tgz
```

重启对应的 Web profile，或让启用的 HMR 应用新插件。进度插件默认开启；翻译插件安装后默认不发请求，必须先配置，再打开其 `enabled`。

### 桌面版

桌面版使用相同的 Web 聊天组件与插件系统。请在桌面版 **Plugins／插件 → 安装** 中使用安装包的本地路径，并在插件详情中设置。应由桌面版自带的插件管理器或捆绑 CLI 操作其 `desktop` profile，避免用另一套 npm DSH 混写桌面依赖。安装界面、桌面 profile 路径和 GUI 操作尚未在实体桌面环境验收；如果你的版本不接受本地包路径，不要改主程序，先确认版本与其官方安装方式。

## 配置

插件详情的标准配置表单可编辑带 `.volatile()` 的字段，下一次生成／新片段读取新值。其他限额通过 profile patch 修改并重新加载插件。示例见 [examples](examples/)；DSH patch 会替换整行 `config`，未写的字段回到插件默认值。

### 进度说明

`enabled` 默认为 `true`；`language` 默认跟随用户本轮语言；`instructions` 是独立的进度提示词，可在详情中调整。清空 `instructions` 或关闭 `enabled` 都不再注入规则。

想让中间回复在任务完成后仍可见，请在 DSH **设置 → 通用 → 收起后显示的回复** 选择 **全部回复／All replies**。本插件尊重现有显示设置，不擅自覆盖你选的“仅最终回答”。原始中间回复依然保存在 Session 中。

这是一种模型行为引导，不保证每个模型都遵守。特别是 DSH 当前用“是否还有工具调用”判断是否继续；因此提示词要求把进度普通文本与真实工具调用放在同一响应中。只发一句“我开始检查”而不调用工具的模型可能结束回合。本插件不会伪造工具或强制追加另一轮来掩盖这一点。

### 公开思考翻译

先填写 DSH 中已经配置好的 `provider` 和该路由接受的 `model` ID，再开启 `enabled`。例如路由名是 `deepseek` 时，就填写 `deepseek`；兼容 OpenAI 的第三方路由应填写你在 DSH 中实际注册的名称，不是 API 地址，也不是臆测的统一名称。插件复用 DSH 的凭证配置，不提供、不保存、不回显 API key 字段。

```yaml
- id: dsh-reasoning-translation
  config:
    enabled: true
    provider: 你的已配置路由名
    model: 你的翻译模型ID
    targetLanguage: 简体中文
    maxCharsPerCall: 1600
    maxCallsPerTurn: 8
    maxPending: 12
    timeoutMs: 45000
    maxOutputTokens: 4096
    maxOutputChars: 16000
```

| 字段 | 默认 | 含义 |
| --- | --- | --- |
| `enabled` | false | 开启后会向所选模型发送公开思考文本，并产生额外费用 |
| `provider`、`model` | 空 | 必须显式填写；可不同于主模型；不自动切换服务商 |
| `targetLanguage` | 简体中文 | 译文语言 |
| `maxCharsPerCall` | 1600 | 每片段 UTF-16 字符上限，切分不拆开代理对 |
| `maxCallsPerTurn` | 8 | 每个 Session 每轮最多接纳的片段数；失败不自动重试 |
| `maxPending` | 12 | 全插件并行会话共享的待处理／正在处理队列上限 |
| `timeoutMs` | 45000 | 单次辅助模型请求期限；不是进度播报定时器 |
| `maxOutputTokens` | 4096 | 传给所选适配器的输出 token 上限 |
| `maxOutputChars` | 16000 | 译文字符上限；截断或超限不标为成功 |

辅助请求串行执行。已结束的段落可在主模型继续工作时开始翻译；很长的段落按长度切分；最后一段等到 reasoning block 完成。超过限额会显示本地的“后续未翻译”提示，不会把它说成模型生成的播报。配置改变后，已接纳的请求使用原配置快照；关闭翻译开关会取消这批工作。原始思考可以包含代码与会话细节，开启即允许将对应公开片段发往选中的服务。主回合 Token 面板未必统计辅助模型费用，以服务商账单为准。

## 恢复、失败与卸载

译文请求在源片段出现时记录位置，在发往模型前要求 Session 存储完成 flush；没有持久化监听器或存储失败时不调用模型。成功译文保存为 `plugin:` ignorable 记录，刷新后重新组装同一条聊天记录，不重新翻译。记录不参与 `deriveMessages()`，不会进入主模型上下文。

超时标记“结果未知”；崩溃后只有请求、没有结果的记录标记“排队／已发起，结果待确认”。这两种情况都不自动重试。重启不会补扫、翻译旧历史，也没有跨会话语义去重缓存；用户主动重新生成是新的主模型尝试，可能产生新的翻译费用。

取消任务会取消该轮未完成翻译；停用／卸载会中止在途辅助请求并移除 UI。若底层 provider 不响应 AbortSignal，服务端仍可能完成计费，但迟到结果不覆盖已取消状态。DSH 存储 flush 的完成由原持久化实现控制；本插件不会为解除底层存储故障而跳过请求日志。默认监听所有实际运行的 Agent Session；子 Agent 的译文属于其自己的 Session，不会混写到主聊天。

仅把配置中的 `enabled` 关掉，会停止新翻译并保留已显示的历史译文；在 Plugins 中关闭整个插件则撤下该 UI。重新启用后可从现有记录恢复。卸载不会删除原文或 Session 里的历史记录。未来 DSH 格式迁移对实验记录只有尽力保留保证。

```sh
dsh plugin --profile web remove dsh-progress-commentary
dsh plugin --profile web remove dsh-reasoning-translation
```

没有网络服务被额外启动，也没有自动任务、外部监控或生产部署。

## 验证情况与本地验收

本次静态／mock 检查见 [docs/VALIDATION.md](docs/VALIDATION.md)。已做构建、严格 TypeScript 检查与无密钥测试；**没有启动用户桌面端、没有真实模型 API 测试、没有 GUI 自动化测试**。

请在一个可丢弃测试 Session 中依次验收：

1. 只开进度插件，给一个需要读取多文件、修改并测试的任务。观察工具调用前后是否出现自然文本，最终回答是否独立。用一个简短问答确认没有强制播报。
2. 打开“全部回复”，任务结束后刷新，确认中间回复保留；再切“仅最终回答”确认只是显示策略变化。
3. 配置并开启翻译，观察带“思考译文 · provider / model”标注的聊天行。原文可展开，最终回答与工具参数不变。
4. 刷新会话，确认已完成译文不重复计费；未完成请求不自动重试。将原文中的不确定性与译文对照，模型翻译可能不准确。
5. 测试取消主任务、断开翻译 provider、较小调用上限、关闭开关及卸载，确认没有伪造完成提示，也不阻塞主模型继续工具调用。
6. 更换 DeepSeek／Gemini 等路由时重验普通文本和工具调用能否交错。没有公开 reasoning 的路由不会凭空产生翻译。

## 从源码复现检查

默认开发目录布局为 `dsh-plugins/` 与 `dsh-research/deepseek-harness/` 同级，也可用 `DSH_SOURCE` 指定上游目录。源码压缩包不重复捆绑上游仓库；若未获取，请先 `git clone https://github.com/deepseek-ai/deepseek-harness.git /绝对路径/deepseek-harness`。先按官方说明安装上游依赖，再执行其必要的生成／类型构建；不需要运行桌面程序：

```sh
# 在官方 DSH checkout 中
git checkout 22ddee3792402c3e70ec5f86a63c3e3e895a2f60
pnpm install --ignore-scripts --frozen-lockfile
pnpm exec tsx scripts/generate-typert.ts
pnpm exec tsc -b vendor/loader packages/client/ui-chat/tsconfig.client.json --pretty false

# 回到本项目
npm ci --ignore-scripts
DSH_SOURCE=/绝对路径/deepseek-harness npm run check
```

上游使用特定的标准装饰器与生成的 Remote 类型，本项目检查脚本保留这些真实类型，不用手写 API stub 冒充兼容。Host 和 Client 分开编译，vendored 框架按其官方 tsconfig 生成声明后再引用。若上游步骤提示缺依赖或安装脚本，按官方说明处理，勿跳过诊断假称已通过。

研究结论见 [技术研究报告](docs/RESEARCH.md)；提示词出处与修改见 [提示词来源](packages/dsh-progress-commentary/prompts/SOURCES.md)。
