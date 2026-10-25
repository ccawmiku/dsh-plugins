# dsh-progress-commentary 0.2.2

DSH 主模型自然语言进度说明插件。通过官方 `systemPrompt.context()` 注册一个 required 运行时上下文，不修改 Agent Loop、不调用第二模型、不生成工具名称模板播报。上下文由 DSH 记入 Session，可复现当时模型看见的规则；完整 persona 模式也不会丢掉这一项。

仅验证官方 DSH `22ddee3792402c3e70ec5f86a63c3e3e895a2f60`，源码基线版本 `0.2.1-rc.3`；清单接受 `0.2.1-rc.2`／`0.2.1-rc.3`，Node ≥24.9。当前 npm 较旧版本不在兼容承诺内。

```sh
dsh plugin --profile web add /绝对路径/dsh-progress-commentary-0.2.2.tgz
```

安装默认启用。Plugins 中可改 `enabled`、`language`、`instructions`、`silenceReminders`、`intervalSeconds`；默认独立提示词是 [prompts/commentary.md](prompts/commentary.md)，来源与改动在 [SOURCES.md](prompts/SOURCES.md)。清空提示词会停止注入。简单任务可以不播报。

**0.2.1 的表达调整**：按 Codex 公开规则重新整理为“发现、影响、待解决的问题”，相关工具操作合并说明；目录读取、搜索、命令执行通常只显示工具行，不逐条复述。动态提醒也不再要求每次报告下一条动作。加入中文风格示例，0.2.2 起沉默提醒默认关闭，默认按有意义的阶段变化播报。出处和 DSH 原生思考显示链路见仓库 docs/PROMPT-STYLE-RESEARCH.md。

**自然触发／可选提醒**：默认 `silenceReminders: false`，不按固定时间强制更新。只有明确开启 `silenceReminders: true` 时，连续 `intervalSeconds`（默认 180）秒没有公开 assistant 文本，才在下一次原有模型响应前加入提醒。已有旧的间隔配置也不会隐式开启它。开场说明只重置一次计时，不代表后续不再更新；实际公开文字才会重置，reasoning、译文和提醒本身不会。模型忽略提醒时保持待更新状态，不增加辅助模型请求或强制续写。各 Session 独立，回合结束清除计时。`intervalSeconds` 可实时配置，例如 300 表示约 5 分钟；短任务不会因为计时而增加额外回复。

DSH 设置中选择“收起后显示的回复 → 全部回复”，才能让中间 assistant 回复在过程折叠后一直可见。插件尊重“仅最终回答”的用户选择，不覆盖设置。

没有 commentary 协议的模型使用普通 assistant 文本与同一响应中的真实工具调用。模型若只输出进度文本、不调用工具，DSH 可能结束回合；插件不会凭空生成工具或强制续写。长工具执行中没有主模型推理发生时，也不会定时编造进度。

关闭插件行会撤销注册；卸载：

```sh
dsh plugin --profile web remove dsh-progress-commentary
```

已经保存的原始 assistant 消息保持不变。验证限于构建、类型和 mock 测试，没有真实模型或桌面 GUI 验证。完整开发工程附带无密钥 Agent Loop 测试、研究报告和中文安装指南。
