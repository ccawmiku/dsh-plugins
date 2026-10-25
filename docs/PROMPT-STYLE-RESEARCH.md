# 公开引导词与 DSH 思考展示核查

> 以下保留 0.2.1 的表达研究。0.2.2 已按最新要求把沉默提醒改为默认关闭，只有 `silenceReminders: true` 才启用；源码依据与表达规则不变。

日期：2026-10-25。目标是改善主模型公开进度的表达，保留已有约 3 分钟沉默提醒。以下区分公开源码事实和本插件的设计判断，不宣称复刻闭源服务的完整行为。

## Codex

本次核对官方 HEAD 为 `970111f6cb62cc02fe36a82ea7d71b37a2889c97`。

- [公开基础指令](https://github.com/openai/codex/blob/970111f6cb62cc02fe36a82ea7d71b37a2889c97/codex-rs/protocol/src/prompts/base_instructions/default.md) 的 Preamble messages：把相关操作合并、承接已有上下文，琐碎读取通常省略说明。
- [模型模板](https://github.com/openai/codex/blob/970111f6cb62cc02fe36a82ea7d71b37a2889c97/codex-rs/models-manager/models.json) 的 gpt-6-astra 条目：Intermediate commentary 关注发现、决定和方向；Writing style 和 Technical communication 强调连贯表达、重要信息先说、解释行动目的和发现影响，不堆散落的实现细节。不能从这一个条目推断所有模型使用相同模板。
- [fallback 提示词](https://github.com/openai/codex/blob/970111f6cb62cc02fe36a82ea7d71b37a2889c97/codex-rs/models-manager/prompt.md) 也含进度规则，但不能把其中的简短工具前说明等同于对每条工具调用都写一句旁白。

本插件的判断：旧提示词过分强调“下一步动作”和同响应工具传输，容易让模型把“我查看目录”也当成合格更新。0.2.1 明确工具行已有操作记录，公开进度应合并相关检查，优先说发现、影响、仍在解决的问题。中文示例是本项目原创，不是上游输出保证。

## Claude Code

核对官方仓库提交 `318b7e6ac4e726e88a4ad326214866a93c373b1b`。

- [仓库 README](https://github.com/anthropics/claude-code/blob/318b7e6ac4e726e88a4ad326214866a93c373b1b/README.md) 与公开目录包括插件、示例和扩展。本次没有找到可核实的完整默认运行时提示词；社区 issue 转述和第三方泄露镜像不作为依据。
- [公开 explanatory-output-style SessionStart 示例](https://github.com/anthropics/claude-code/blob/318b7e6ac4e726e88a4ad326214866a93c373b1b/plugins/explanatory-output-style/hooks-handlers/session-start.sh) 把说明重点放在具体实现选择和代码库特有的见解，而非一般性教学；这是可选风格示例，不是完整默认提示词。没有复制其 Insight 框或要求每次修改都解释。
- [官方输出风格文档](https://code.claude.com/docs/en/output-styles) 描述 Concise 风格：首先给结果，减少开场、逐步旁白和重复回顾；并明确风格指令不是行为的硬保证。此处只借鉴“省略无意义旁白”的设计方向，不把它改成完全无进度输出。

未复制 Anthropic 提示词，未推断其内部精确触发机制。

## DSH 英文思考为何自然

固定源码为 `22ddee3792402c3e70ec5f86a63c3e3e895a2f60`。

1. [DeepSeek 适配器](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/llm/llm-deepseek/src/translate.ts) 把模型 thinking_delta 归一化为 reasoning-delta；[pi-ai 适配器](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/llm/llm-pi-ai/src/stream.ts) 同样透传路由提供的 thinking 文本。模型服务究竟提供原始可见思考还是摘要，取决于路由；DSH 这段 UI 没有再次请求模型编造状态。
2. [AssistantMarkdown](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/client/ui-chat/src/client/chat/AssistantMarkdown.tsx) 把 reasoning block 交给独立 ReasoningRow，普通 text block 单独展示。
3. [ReasoningRow](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/client/ui-chat/src/client/chat/ReasoningRow.tsx) 在流式期间取最近已完成段落的首行作折叠预览，结束后用首行；只去掉双星号标记。这是从已有文本提取预览，不是语义总结器。
4. [ReasoningContent](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/client/ui-chat/src/client/chat/ReasoningContent.tsx) 用紧凑 Markdown 展示全文，不另写“我正在执行某工具”的模板。

截图中的“已完成分析”还是 [DSH 本地化状态文案](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/client/ui-chat/src/client/locale.ts)，不是主模型写的一句进度；本轮调整针对模型输出的动作流水账。

本轮保留这条原生显示链路，未把 reasoning 冒充主模型公开回复，也未增加一个用于生成状态文案的模型。对主模型进度只改写作引导与提醒措辞；对译文仍保持忠实翻译。

## 目标表达示例

“我查看 resources 目录。我搜索安装日志。我查看恢复目录。”这类动作序列通常留给工具行。

有证据后可合并成：“安装日志指向本地安装包，npm 上也没有这个版本。接下来核对恢复目录，确认能否原地升级。”

这是期望的语气和信息粒度，不是固定句式。没新结论时可说明正在核实的关键问题，不为显得自然而编造结果。
