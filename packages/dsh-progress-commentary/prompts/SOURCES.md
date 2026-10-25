# 提示词来源与修改

上游：OpenAI Codex，Apache-2.0，Copyright 2025 OpenAI，固定提交 `970111f6cb62cc02fe36a82ea7d71b37a2889c97`。本包保留完整 LICENSE 与上游 NOTICE。`commentary.md` 是**修改后的派生提示词**，并非宣称原封不动复刻 Codex 服务。

1. [models-manager/models.json](https://github.com/openai/codex/blob/970111f6cb62cc02fe36a82ea7d71b37a2889c97/codex-rs/models-manager/models.json)：`models[slug=gpt-6-astra].model_messages.instructions_template` 的 `## Intermediate commentary`。这是实际模型描述数据中的指令，而不是面向开发者的建议。保留“简短且有意义、假设／发现／决定／方向变化、让用户理解和核验、最终回答独立可读”等规则。
2. [base_instructions/default.md](https://github.com/openai/codex/blob/970111f6cb62cc02fe36a82ea7d71b37a2889c97/codex-rs/protocol/src/prompts/base_instructions/default.md)：`Preamble messages` 与 `Sharing progress updates`。保留“逻辑分组工具操作、1–2 句、承接已知上下文、大块工作前说明、略过琐碎读取”等规则。models-manager 的 fallback `prompt.md` 同样含这些规则。

为 DSH 做的必要适配：

- 将专用 commentary 通道改为同一响应中的普通 assistant 文本＋真实工具调用。
- 初版去掉原版每 60 秒和英文 8–12 词之类限制；0.2.0 根据用户反馈增加默认 180 秒沉默提醒，在下一次已有模型响应时更新动态上下文，不启动定时请求或按工具次数催促。
- 允许短任务直接回答；保留主要进度规则，省去 Codex 其他与本功能无关的长指令。
- 增加 DSH 的工具驱动续行约束、不得造工具、不能把 reasoning 当播报、失败／取消不得假报完成。这些是本插件自己的适配。
- 语言通过配置补入；不复制 Anthropic 非公开提示词。

`codex-original-excerpts.md` 保存此次核对的原文节选，仅供出处核对，**不注入模型**。实际注入内容是 `commentary.md`、语言偏好以及达到沉默间隔时的简短提醒。上下文由 DSH 正常持久化和复用，不修改已经冻结的模型请求，不将词数当实测 token 数。

## 0.2.1 表达调整（2026-10-25）

再次核查 Codex HEAD 仍为上述 SHA。除 Intermediate commentary 外，还核对同一模型模板的 Writing style 和 Technical communication：借鉴连贯段落、具体发现与其影响、必要细节和行动目的，避免把工具动作逐条报给用户。保留基本消息协议，重写为原创适配表述和中文示例，不照抄英文例句或固定口吻。

Claude Code 官方仓库核查到 `318b7e6ac4e726e88a4ad326214866a93c373b1b`。其 explanatory-output-style 的公开 SessionStart 示例侧重具体实现选择与代码库见解；官方 output-styles 文档的 Concise 风格明确减少逐步旁白。仓库中没有核实到完整默认运行时提示词；未把社区 issue 中的提示词摘录当作官方事实，也未复制 Anthropic 提示词或其 Insight 模板。完整链接与 DSH 源码核查见仓库 docs/PROMPT-STYLE-RESEARCH.md。

## 0.2.2 自然触发默认值（2026-10-25）

按本次任务“不强制每隔固定秒数输出”的要求，保留 0.2.1 的表达和公开来源，明确不得使用时间／工具次数配额强迫播报。已有沉默提醒成为 `silenceReminders: true` 才启用的可选功能，默认关闭；它仍不新增模型调用或定时器。这是 DSH 适配规则，不声称来自上游默认配置。
