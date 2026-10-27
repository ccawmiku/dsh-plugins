# dsh-reasoning-translation 0.2.1

把 DSH 已公开的 reasoning 翻译成聊天中的自然段落，使用 DSH 原生 Markdown 与主题排版。去掉卡片边框、灰化正文和顶部模型信息；下方的小号“思考译文”展开原文与模型来源。译文支持逐步显示。

支持 DSH `0.2.1-rc.2`／`0.2.1-rc.3`，Node ≥24.9.0。源码验证基线为官方提交 `22ddee3792402c3e70ec5f86a63c3e3e895a2f60`，其他构建须重新验收。

```sh
dsh plugin --profile web add /绝对路径/dsh-reasoning-translation-0.2.1.tgz
```

桌面版用内置插件管理器安装，升级后重启。进入 **设置 → 思考翻译**，查看当前模型，从已配置模型目录中选择，或手动填写 `provider` 路由与 `model` ID，再开启并保存。凭证仍由 DSH 管理，插件没有 API key 字段。新片段立即使用新配置，已排队片段保留原配置快照。

**取消每轮翻译条数与总队列上限**，旧的 `maxCallsPerTurn`／`maxPending` 即使仍在配置中也不生效。所有新片段串行翻译，慢模型会积压；关闭开关可取消待处理工作。没有补扫历史或自动重试。翻译会额外调用所选模型并产生费用，主回合 Token 面板不保证统计辅助费用。

单次默认：源片段 1600 字符、45 秒超时、4096 输出 token、16000 译文字符。长原文继续切分，不限制总数。可在 profile patch 修改 `maxCharsPerCall`、`timeoutMs`、`maxOutputTokens`、`maxOutputChars` 后重载。这些是单次请求约束，不是翻译条数上限。

请求先记录并 flush，再发送；模型普通文本每 200ms 至多保存一个逐步显示快照，完整成功后记录最终译文。刷新重放同一条聊天行，不重复请求。只有请求或半成品的历史结果待确认，不自动重试。失败、截断或工具调用不算成功；取消后迟到结果不覆盖状态。公开原文与翻译身份始终可展开核对。

译文不会进入主模型上下文，不改工具参数或最终回答。原文由 DSH 保存；子 Agent 内容属于它自己的 Session。关闭翻译开关保留历史译文，停用整个插件撤下 UI。卸载不删除原文或已保存记录。若远端忽略取消仍可能计费。

```sh
dsh plugin --profile web remove dsh-reasoning-translation
```

完整配置、验证范围和进度插件说明见仓库根目录 README 与 docs/VALIDATION.md。

0.2.1 修复跨轮次积压的生命周期取消：销毁 Agent／Session 时，较早已完成主回合的翻译也会中止，排队请求不再派发；不向已销毁 Session 追加迟到结果。会话恢复不自动续译未完成项。

## 独立目录构建

本插件现已拆到集合仓库根目录，包名、版本及运行行为保持不变。

```sh
npm install --ignore-scripts
npm run build
npm run pack:plugin
```

安装包输出到本目录的 `dist/`。跨插件的 Agent Loop、公开思考译文和打包回归测试保留在 [共享验证工程](../tools/conversation-plugins/README.md)，该工程仅用于开发，不是需要额外安装的插件。
