# 提示词来源与修改

上游：OpenAI Codex，Apache-2.0，Copyright 2025 OpenAI，固定提交 `970111f6cb62cc02fe36a82ea7d71b37a2889c97`。本包保留完整 LICENSE 与上游 NOTICE。`commentary.md` 是**修改后的派生提示词**，并非宣称原封不动复刻 Codex 服务。

1. [models-manager/models.json](https://github.com/openai/codex/blob/970111f6cb62cc02fe36a82ea7d71b37a2889c97/codex-rs/models-manager/models.json)：`models[slug=gpt-6-astra].model_messages.instructions_template` 的 `## Intermediate commentary`。这是实际模型描述数据中的指令，而不是面向开发者的建议。保留“简短且有意义、假设／发现／决定／方向变化、让用户理解和核验、最终回答独立可读”等规则。
2. [base_instructions/default.md](https://github.com/openai/codex/blob/970111f6cb62cc02fe36a82ea7d71b37a2889c97/codex-rs/protocol/src/prompts/base_instructions/default.md)：`Preamble messages` 与 `Sharing progress updates`。保留“逻辑分组工具操作、1–2 句、承接已知上下文、大块工作前说明、略过琐碎读取”等规则。models-manager 的 fallback `prompt.md` 同样含这些规则。

为 DSH 做的必要适配：

- 将专用 commentary 通道改为同一响应中的普通 assistant 文本＋真实工具调用。
- 按本任务要求，去掉原版每 60 秒和英文 8–12 词之类限制，采用有信息价值的阶段变化，不按钟表或每个工具调用强制输出。
- 允许短任务直接回答；保留主要进度规则，省去 Codex 其他与本功能无关的长指令。
- 增加 DSH 的工具驱动续行约束、不得造工具、不能把 reasoning 当播报、失败／取消不得假报完成。这些是本插件自己的适配。
- 语言通过配置补入；不复制 Anthropic 非公开提示词。

`codex-original-excerpts.md` 保存此次核对的原文节选，仅供出处核对，**不注入模型**。实际注入内容是 `commentary.md` 加语言偏好。该文件本次约 309 个英文单词（不将词数当实测 token 数），单个简短上下文由 DSH 自己记录／复用，不在每个工具结果后重复追加。
