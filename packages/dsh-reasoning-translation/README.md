# dsh-reasoning-translation

独立翻译 DSH **已公开的 reasoning 文本**，在现有聊天流中显示标明来源的译文，并提供原文展开。它不是主模型进度播报，不提取未公开或加密推理，也不改变主模型上下文、工具参数或最终回答。

仅验证官方提交 `22ddee3792402c3e70ec5f86a63c3e3e895a2f60`，DSH `0.2.1-rc.3`，Node ≥24.9；不声明兼容旧 npm 桌面发行版。安装使用当前 DSH 官方插件管理机制，无需 Fork：

```sh
dsh plugin --profile web add /绝对路径/dsh-reasoning-translation-0.1.0.tgz
```

安装默认 `enabled: false`。在 Plugins 详情先填写已经配置在 DSH 中的 `provider`、对应 `model` ID 与 `targetLanguage`，然后开启开关。模型可不同于主模型；凭证仍由 DSH 管理，插件没有 API key 配置项。桌面版用其自带插件管理器安装同一包，具体 GUI 尚待本地验收。

**开启后会额外调用模型并产生费用，公开思考片段会发送到选中的 provider。** 不会自动改用其他翻译服务。普通长段落按 1600 UTF-16 字符切分；已结束段落尽早翻译。默认每 Session 每轮最多接纳 8 段，全插件队列上限 12，辅助请求串行，每次模型请求 45 秒、最多 4096 输出 token、16000 译文字符。可在 profile patch 调整这些字段后重载：`maxCharsPerCall`、`maxCallsPerTurn`、`maxPending`、`timeoutMs`、`maxOutputTokens`、`maxOutputChars`。

译文可能滞后于主模型最终回答；模型翻译可能有误，不证明任务已完成。超限显示“后续未翻译”，不会静默假装全部翻完。辅助模型若返回 tool call、错误或截断，不执行该工具、不标为翻译成功。

翻译请求先保存并 flush Session，再允许发 API；只有完整成功结果才显示译文。完成结果通过实验性 `plugin:` ignorable 记录保存，刷新后重放同一条聊天行，不再调用模型；只有请求没有结果时显示“结果待确认”。超时结果未知与所有失败都**不自动重试**，也不补扫历史。切换到另一个模型后，只有新的源片段使用新配置；重新生成主回答属于新尝试，可能再次翻译。主轮 Token 面板不保证统计辅助费用。

关闭 `enabled` 取消新旧队列、停止新请求，历史译文保留。Plugins 中关闭整个包会移除译文 UI；原始思考始终由 DSH 保存。取消主任务、停用或卸载不会制造完成消息；服务端忽略取消时仍可能计费，但迟到结果不覆盖取消状态。未来 DSH 迁移对实验记录是尽力保留。默认会处理所有运行中的 Agent Session，子 Agent 内容保存到自己的 Session。

```sh
dsh plugin --profile web remove dsh-reasoning-translation
```

原文和已有记录不会被删除。构建、类型检查和 mock 测试不等于真实桌面／模型验证；请用临时会话检查翻译、刷新、取消、断网、超限和卸载。本包与官方“展开思考栏翻译”不同，若两者同时启用，可能各自收费，通常选其一。
