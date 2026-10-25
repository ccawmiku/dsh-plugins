> 本文主体保留 0.1.0 的原始架构研究。当前版本为翻译 0.2.1／进度 0.2.2；当前行为以根 README 与 VALIDATION 为准。

# DSH 自然语言进度与公开思考翻译：技术研究记录

研究日期：2026-10-23。本文区分源码事实、文档保证、适配判断与尚未验证项。所有上游仓库只读获取；实现位于独立 `dsh-plugins/`，未改核心源码。

## 1. 固定研究基线与许可

| 项目 | 本次获取的默认分支 SHA | 许可／采用范围 |
| --- | --- | --- |
| OpenAI Codex main | `970111f6cb62cc02fe36a82ea7d71b37a2889c97` | Apache-2.0；复用公开提示词规则，保留 LICENSE、NOTICE 和修改说明 |
| Anthropic Claude Code main | `30fa83c68c77d2e3a7a42f1407831ec252511130` | 仓库 LICENSE 指向 Anthropic Commercial Terms；只研究公开资料，不复制来源不明的内部提示词 |
| DeepSeek Harness master | `22ddee3792402c3e70ec5f86a63c3e3e895a2f60` | MIT；按其官方扩展接口实现，测试装饰器变换借鉴上游 MIT 测试辅助代码 |

DSH 源码版本是 `0.2.1-rc.3`。本次 `npm view @deepseek-ai/dsh-llm version` 返回 `0.0.1-rc.1`，因此“适配最新 GitHub 源码”不等于“兼容当前 npm 旧版桌面”。清单中设置精确 `engines.dsh`，不建议添加兼容性豁免来强装。后续交付上传至独立仓库，不向这三个上游仓库推送，也不修改其默认分支。

## 2. Codex：确实存在参与运行的提示词与消息协议

### 已在官方源码确认

用户给的 [protocol/src/prompts/base_instructions/default.md](https://github.com/openai/codex/blob/970111f6cb62cc02fe36a82ea7d71b37a2889c97/codex-rs/protocol/src/prompts/base_instructions/default.md) 包含 `Preamble messages` 和 `Sharing progress updates`：工具操作逻辑分组、1–2 句、承接已有发现、琐碎读取可省略、大块工作前说明。不是工具事件自动翻译器。

进一步检查 [models-manager/models.json](https://github.com/openai/codex/blob/970111f6cb62cc02fe36a82ea7d71b37a2889c97/codex-rs/models-manager/models.json)，实际模型数据的 `model_messages.instructions_template` 中也有 `## Intermediate commentary`。例如本次 `gpt-6-astra` 条目明确要求通过 commentary 说出假设、发现、决定或方向变化，并让最终回答独立可读；原文还有 60 秒与工具前更新要求。本项目保存了原文节选，实际规则依用户要求删掉固定时间，放宽短任务。

[models-manager/src/model_info.rs](https://github.com/openai/codex/blob/970111f6cb62cc02fe36a82ea7d71b37a2889c97/codex-rs/models-manager/src/model_info.rs) 的 `BASE_INSTRUCTIONS` 通过 `include_str!("../prompt.md")` 提供 fallback，`with_config_overrides()` 将配置的 `base_instructions` 放进模型指令模板。因此不能仅凭某一个 default.md 就认定全部模型运行完全相同的提示词；模型描述与本地覆盖也参与选择。

[protocol/src/models.rs](https://github.com/openai/codex/blob/970111f6cb62cc02fe36a82ea7d71b37a2889c97/codex-rs/protocol/src/models.rs) 的 `MessagePhase` 明确区分 `Commentary`、`PartialAnswer`、`FinalAnswer`；`None` 是未知阶段，兼容旧模型，不应该猜成 commentary。

[core/src/event_mapping.rs](https://github.com/openai/codex/blob/970111f6cb62cc02fe36a82ea7d71b37a2889c97/codex-rs/core/src/event_mapping.rs) 的 `parse_agent_message()` 保留 `phase`；[core/src/stream_events_utils.rs](https://github.com/openai/codex/blob/970111f6cb62cc02fe36a82ea7d71b37a2889c97/codex-rs/core/src/stream_events_utils.rs) 的 `assistant_message_defers_mailbox_delivery()` 按 phase 分别处理 commentary／partial 与 final，未知阶段保留旧可见文本行为。不是根据“接下来”之类词语判断阶段。

[app-server/src/bespoke_event_handling.rs](https://github.com/openai/codex/blob/970111f6cb62cc02fe36a82ea7d71b37a2889c97/codex-rs/app-server/src/bespoke_event_handling.rs) 将 `AgentMessageContentDelta` 等事件经 `item_event_to_server_notification()` 发送，并有 ItemStarted／ItemCompleted 生命周期。[core/src/session/turn.rs](https://github.com/openai/codex/blob/970111f6cb62cc02fe36a82ea7d71b37a2889c97/codex-rs/core/src/session/turn.rs) 是模型流到这些文本事件的生产路径之一。[protocol/src/protocol.rs](https://github.com/openai/codex/blob/970111f6cb62cc02fe36a82ea7d71b37a2889c97/codex-rs/protocol/src/protocol.rs) 也保留 Session 的 base instructions，用于恢复。

### 结论与边界

“什么时候值得说、怎么说”主要是模型指令；“流式到达、哪条消息、阶段、持久化与最终展示”需要 Harness 的事件与 UI。源码中这些指令并不是外部计时器强迫模型打断某个正在执行的工具。远程模型服务也可能提供更新的 model instructions；本次只能确认公开仓库该 SHA，不能宣称还原私有服务的全部运行配置。

## 3. Claude Code：可确认公开机制，不假装获得内部提示词

[官方仓库基线](https://github.com/anthropics/claude-code/tree/30fa83c68c77d2e3a7a42f1407831ec252511130) 提供文档、扩展示例与变更记录，但本次未找到可合法直接复用的完整 CLI 内部进度提示词。没有转向来源不明的泄露提示词。

[官方流式消息文档](https://platform.claude.com/docs/en/build-with-claude/streaming) 明确区分 text、thinking 和 tool_use 内容块及其增量事件，包含 block start／delta／stop、工具 JSON 增量与 thinking 增量。因此普通文本可以和工具内容同属模型响应；thinking 不是用户进度文案。这是 API 协议事实，不足以证明 Claude Code 每个内部触发规则。

[Hooks 官方文档](https://code.claude.com/docs/en/hooks) 说明工具前后、SessionStart、Stop 等生命周期扩展及上下文注入方式。Hook 可补充上下文、响应事件或处理展示，但固定日志通知并不等于主模型主动判断后的自然进度。所谓 prompt／agent hook 也可能引入额外模型调用，不适合本任务零额外调用的进度插件。

由公开结构可推断：如果 Harness 保留普通文本与 tool_use 顺序，它可以显示模型自己生成的过渡说明。Claude Code 具体内部播报提示词、时机策略与私有展示逻辑仍未验证；本项目没有复制或宣称复刻这些部分。

## 4. DSH 最新源码实际做了什么

固定源码链接均以 [DSH 基线](https://github.com/deepseek-ai/deepseek-harness/tree/22ddee3792402c3e70ec5f86a63c3e3e895a2f60) 为准：

| 相关文件／关键符号 | 源码确认的行为 |
| --- | --- |
| [docs/architecture.md](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/docs/architecture.md) | 全插件 Cordis；桌面承载完整 Web UI；模型流、Session 日志与插件生命周期分离 |
| [core/system-prompt/src/index.ts](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/core/system-prompt/src/index.ts) `section()`／`context()` | system sections 可被 complete persona 取代；required runtime context 在可选上下文关闭时仍保留 |
| [core/agent-loop/src/agent.ts](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/core/agent-loop/src/agent.ts) | 完整文本先提交 assistant/message，再执行其中 tool-call；没有工具调用则回合结束 |
| [core/agent-loop/src/assistant-stream.ts](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/core/agent-loop/src/assistant-stream.ts) `AssistantStreamAttempt` | 发送 start／chunk／end；完成或中断的 compact stream 进入 durable assistant/message／assistant/attempt |
| [llm/llm/src/types.ts](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/llm/llm/src/types.ts) | text-delta、reasoning-delta、tool-call-delta 分开；没有可直接套用的 OpenAI MessagePhase |
| [llm/llm-deepseek/src/translate.ts](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/llm/llm-deepseek/src/translate.ts)、[llm-pi-ai/src/stream.ts](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/llm/llm-pi-ai/src/stream.ts) | 适配器分别归一化普通文本与公开 reasoning；不能把所有 Gemini／OpenAI 路由当同一通道协议 |
| [core/session/src/index.ts](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/core/session/src/index.ts) `deriveMessages()`／`appendPluginRecord()` | 主模型历史只取 model-visible surface；实验 ignorable 记录可留插件显示状态，不污染模型输入；写入后可用 SessionStore.flush() 检查点 |
| [client/ui-chat/src/chat-settings.ts](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/client/ui-chat/src/chat-settings.ts) | `foldedReplies` 支持 all／final，默认 all |
| [client/ui-chat/src/client/conversation-nodes/README.md](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/client/ui-chat/src/client/conversation-nodes/README.md) | 全部回复时普通 assistant 中间文本在折叠过程外；最终答案按已结算且无工具调用的结构判定 |
| [client/ui-chat/src/client/chat/ReasoningRow.tsx](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/client/ui-chat/src/client/chat/ReasoningRow.tsx) | 公开 reasoning 默认是独立可展开行，属于过程内容，不是普通回复 |

**核心问题的回答：** 在该最新版上，不能笼统说“DSH 会吞掉所有中间自然语言”。普通文本链路已经存在，而且能持久化。主模型没生成普通文本、只产生 reasoning，或者设置选了折叠后只保留最终回答，都会造成用户观察到的长时间无进度。我们无法仅靠源码确定你现有安装具体是哪一种原因；需要本地对照原始 Session 和版本。

## 5. 已有翻译功能与本次两插件方案

[官方 cot-translation-bundle](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/experimental/cot-translation-bundle/README.md) 已经翻译展开的 reasoning，默认 Bing、可选 Google，付费模型路由限定 DeepSeek Flash；原文不改、结果可保存。但它不等于“任意已配置模型＋直接显示在聊天流”。本项目不重复改造原服务，也不启用官方翻译来制造双重请求。

### 进度插件

采用 `systemPrompt.context({ required: true, interpolate: false })`，而不是修改冻结后的 llm/stream 请求。这样 complete persona 不会丢掉规则，内容又由 DSH 正常记录，不违背 model-visible means logged。独立提示词正文约 309 个英文词，另有 20 词的出处修改注释，语言可配；没有工具事件拼文案、计时器、额外请求或新 UI。

与 Codex 不同：DSH 没有显式 commentary／final phase，采用已有“文本＋真实工具调用”交错链路，最终答案仍由原 Loop／UI 的结构规则决定。**仅靠提示词无法保证不合作的模型总是播报，也不能让只输出文字的响应继续执行。** 不引入脆弱字符串猜测、假工具或强制续写循环。

### 公开思考翻译插件

只监听 live `agent/assistant-stream` 的 reasoning-delta／reasoning block-end。完成段落或长度边界时建立一个片段，普通 text 和工具参数均不进入翻译。辅助模型通过现有 `ctx.llm.stream()` 使用显式 provider／model，不经过 Agent Loop，因此不递归触发本插件；不绑定 DeepSeek／Gemini 名称，不携带完整聊天历史。

先同步保存源片段的 ignorable request 来确定聊天顺序，再在串行队列中 flush，成功后才发辅助请求。完成结果写 result 记录。请求／结果共享稳定片段 ID，ConversationNodeDefinition 的 start／update 只更新同一 Chat node；`groupTree: 'turn'` 让译文不随原思考过程收起。客户端走官方 `conversation.chat.node` keyed Slot，没有 DOM 查询、HTML 注入、额外窗口或通知中心。

客户端按 `dsh.client` 声明打包成官方要求的 `window.__ModuleLoader__.load({id,factory})`，只运行一次注册，React 从已有 module table 取用。Host 与 Client 是同一安装包的两个入口；客户端只解析记录并显示，不能发 API，也不会根据刷新自行补调用。

原文不改、译文不入 deriveMessages、unknown 不自动重试、失败不自动更换 provider、取消迟到不标成功。实验记录的格式版本为 1，持久化输入运行时校验，不认识的版本忽略。具体预算与限制见 README。

## 6. 验证与仍需本地验证

已完成的检查以 [VALIDATION.md](VALIDATION.md) 的实际命令为准。无密钥测试使用真实 Cordis／DSH Agent Loop、Session、工具执行链与 ConversationNodeAssembler，模型输出与 flush 监听器是 mock；这能验证调用数量、顺序、原文／上下文隔离和重放，不证明真实 provider 的质量、费用或 OS 断电耐久性。

尚未验证：当前桌面安装对应的真实 SHA；桌面 UI 安装与布局；真实 DeepSeek／Gemini 模型是否遵守提示词并交错文本与工具；不同模型翻译质量与速率；真实计费；生产持久化写盘失败／断电恢复；DSH 后续 Session 格式迁移对实验记录的保留。

不需要核心 Fork 的部分已经实现。若未来需要“任何模型只输出 commentary 文本后也继续循环，并严格区分 final”，最小上游方向是给 provider-neutral assistant 消息增加明确 phase／continuation 元数据，并从适配器贯通 Loop、Session、恢复与 UI；这属于核心协议改动，不在本次插件里伪造。

## 7. 2026-10-24 UTC 最新源码复核与交付修复

重新获取远端 HEAD：DSH `22ddee3792402c3e70ec5f86a63c3e3e895a2f60` 与 Codex `970111f6cb62cc02fe36a82ea7d71b37a2889c97` 均未变化。Claude Code 最新为 [`318b7e6ac4e726e88a4ad326214866a93c373b1b`](https://github.com/anthropics/claude-code/tree/318b7e6ac4e726e88a4ad326214866a93c373b1b)；核对相对原基线的提交和差异，变更在 CHANGELOG、feed 与 sec-default mod 的 hook 规则和说明，未发现新的可直接复用的完整内部进度提示词。原版公开提示词、许可与通道机制的结论不变。

交付仓库采用远端 main `552f4b1741d142c13420862430ddbc8dfcff5d73`，保留已合并的翻译 0.2.0 设置页、Markdown 正文、译文流式快照与无条数上限行为。翻译插件升至 0.2.1；进度插件保持 0.1.0，不额外调用模型，也不把翻译冒充为主模型进度。

源码审查发现跨轮次积压的取消漏洞：原实现的 `turns` 仅保存当前回合控制器，较早已完成主回合的翻译仍可能占用串行队列；销毁 Agent／Session 只中止当前回合，无法覆盖此前接纳的请求。新增真实 AgentHandle 生命周期回归：第一轮积压两段，第二轮完成后销毁 Agent，修复前辅助请求 AbortSignal 仍为 false，稳定复现。现在每个 Session 的所有翻译共享生命周期信号，Agent／Session 销毁时统一中止，已销毁 Session 不再追加迟到结果。

证据链：上游 [`AgentHandle.dispose()` 与 `agent/disposed`](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/core/agent/src/index.ts)、[`session/disposed`](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/core/session/src/index.ts)；本项目 `packages/dsh-reasoning-translation/src/index.ts` 与 `tests/loop.spec.ts` 的跨回合取消测试。普通回合正常结束仍允许翻译继续排队；关闭翻译、取消当前任务、卸载等原语义不变。服务商忽略取消时仍可能产生已派发调用的费用，不声称能够撤销远端计费。

## 8. 2026-10-25 UTC 最新基线与自然触发

交付基线推进到 main `fde95daf0749666680982d59ef9f947b72c6754c`，不覆盖已合并的自然表达、翻译设置和取消修复。远端 HEAD 再次确认：DSH 为 `22ddee3792402c3e70ec5f86a63c3e3e895a2f60`，Codex 为 `970111f6cb62cc02fe36a82ea7d71b37a2889c97`，Claude Code 为 `318b7e6ac4e726e88a4ad326214866a93c373b1b`，已有固定链接和许可结论仍适用。

本次要求不按固定秒数强制播报，因此进度 0.2.2 通过独立的 volatile 布尔配置 `silenceReminders` 将已有时间提醒改为默认关闭。默认只注入基于发现、阶段变化、阻碍的自然进度规则；可选提醒仍可由使用者明确开启，不增加定时器、工具或模型调用。提示词与传输展示继续分离，原有普通文本＋真实工具调用链路不变。当前限制仍是模型可能不遵循指令，或 provider 无法交错普通文本与工具调用；本插件不会以辅助模型、伪工具或字符串猜测掩盖这些限制。
