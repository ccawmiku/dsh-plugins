# 验证记录

## 2026-10-25 UTC 云端验收：翻译 0.2.1／进度 0.2.2

以最新 main `fde95daf0749666680982d59ef9f947b72c6754c` 为基线，保留 PR 1–4 已合并功能。重新查询 DSH、Codex 和 Claude Code 远端 HEAD，仍分别为本报告已固定的源码提交。

新增默认不按固定时间催促的集成回归：修复前，未配置提醒开关也会在时间阈值后注入到期指令，实际复现失败；修复后必须显式 `silenceReminders: true` 才启用原有间隔逻辑。验证默认、180 秒及 600 秒 opt-in、Session 隔离、公开文字重置和回合结束清理，模型调用数量始终是脚本中的 5 次，无额外请求。

本轮执行 `npm run check`：构建、Host／Client 分离严格类型、两个真实 npm 安装包加载与 **7 个测试文件、45 项测试通过**。使用真实 Cordis、DSH Loop／Session／会话组装器，模型与存储 flush 为 mock。未使用真实模型凭据，未运行真实 provider、桌面或本轮 GUI 验收；既有 Windows 验证只作为下方历史记录保留。

产物为 `dist/dsh-progress-commentary-0.2.2.tgz` 与 `dist/dsh-reasoning-translation-0.2.1.tgz`；源码与协议不需要核心 Fork。

## 2026-10-25 合并复核：翻译 0.2.1／进度 0.2.1

环境为 Node 24.19.0。完成 PR 2（翻译 0.2.1 修复跨轮次取消）与 PR 4（进度 0.2.1 优化自然表达）合并，执行 `npm test`，7 个测试文件、44 项测试全部通过。产物为 `dist/dsh-reasoning-translation-0.2.1.tgz` 与 `dist/dsh-progress-commentary-0.2.1.tgz`，校验见 SHA256SUMS。

## 2026-10-24 UTC 云端交付复核：翻译 0.2.1

环境为 Linux x86-64、Node 24.19.0。从远端 main `552f4b1741d142c13420862430ddbc8dfcff5d73` 开始，保留既有更新；DSH／Codex 的远端 HEAD 与固定研究基线一致，Claude Code 最新提交已补查，见 RESEARCH。此前 Windows 桌面记录作为历史证据保留在下方，不表示本次启动或操作过用户桌面。

依锁文件执行 `npm ci --ignore-scripts`，新版基线 `npm run check` 的构建、严格类型、打包、41 项测试通过。新增跨轮次积压的真实 AgentHandle 销毁回归后，先在未修复实现中复现失败：第一轮翻译在第二轮结束、Agent 销毁后仍未被取消。修复后执行最终 `npm run check`，构建、Host／Client 分离严格类型检查、两个安装包加载及 **7 个测试文件、42 项测试全部通过**。

回归使用真实 Cordis、Agent Loop、Session 和 AgentHandle 生命周期，模型、flush 为 mock；确认积压的先前回合也收到 AbortSignal，已排队的额外请求不派发，迟到模型文本不记录为成功。进度插件仍只使用主模型原有请求。检查没有调用真实模型，没有启动桌面或进行本轮 GUI 验收，不证明真实 provider 翻译质量、计费、遵循提示词的程度或断电恢复。

当前产物为 `dist/dsh-reasoning-translation-0.2.1.tgz` 与 `dist/dsh-progress-commentary-0.2.1.tgz`，校验见 SHA256SUMS；提示词来源与许可文件均随包保留。

## 历史记录：0.2.0 Windows 验证

2026-10-25（北京时间），Windows x64，Node 24.19.0。翻译插件版本 0.2.0；进度插件源码保持 0.1.0。

## 自动化验证

官方 DSH 基线 `22ddee3792402c3e70ec5f86a63c3e3e895a2f60`（0.2.1-rc.3），依照锁文件安装依赖，执行 `generate-typert.ts`，按真实项目引用构建 `vendor/loader` 和 `ui-chat` Client 类型。

设置 `DSH_SOURCE` 后执行 `npm run check`：构建、Host／Client 分离严格类型检查、npm 打包与 **43 项测试**。测试使用真实 Cordis、Session、Agent Loop、ConversationNodeAssembler、React 和 DSH Markdown，模型及存储 flush 是 mock。

- 真实 Loop：只翻译公开 reasoning，不附带主会话；主模型文本与工具顺序不变，译文不进入 deriveMessages。
- 无条数上限：单源超过 128 段、160 个待处理片段仍全部接纳；真实 Host 带旧配置 `maxCallsPerTurn: 1`／`maxPending: 1` 时，24 段仍全部翻译。请求维持串行，持久化失败不发请求。
- 逐步显示：只显示翻译模型普通文本，不显示翻译模型自身 reasoning，progress 更新同一 key，完整结果取代半成品，重放同样成立。
- 设置交互：显示已保存模型、加载目录、模型与 provider 原子保存、revision fence、拒绝保存保留编辑、缺项校验和撤销。
- 真实 Markdown：粗体／行内代码正常，源 `<script>` 不执行，正文无侧边框，原文和来源默认折叠。
- 取消、卸载、超时、忽略取消的适配器、无 finish／错误／截断／工具响应等既有回归均通过。
- 缺少路由时启用插件不使主任务启动失败；构建后的 Host／Client 与 npm 安装包可加载。

## 本机检查

本机 DSH NEXT 2.0.19-next，内置 DSH 0.2.1-rc.2。直接核查捆绑的 ui-settings ConfigForms、whileServed、mutate、modelCatalog 和聊天 UI 接口，具备本次所用能力。

只读检查当前 Session：进度提示词确实存在；最近三轮分别有 79、16、15 个 assistant 步骤，但每轮只有一个普通文本步骤，且没有普通文本伴随工具调用。这支持“提示词已注入，但模型未生成公开中间回复”的定位，不能声称零请求提示词插件保证进度播报。

已备份本机旧翻译插件，并更新其安装目录与本地 0.2.0 安装包；没有修改主程序、已有模型路由或用户会话。经用户授权重启 DSH 后，真实设置页已显示“思考翻译”、既有模型、模型目录下拉菜单与路由／模型 ID／目标语言编辑项。

实体界面验收发现 ConfigForm 实例方法被当作无绑定回调传给 React 会失去 this；已改为稳定闭包调用并补充保持实例绑定的回归验证。

本机旧安装把翻译配置写在手动 insert 项中，标准设置写入无法覆盖。已单独备份并将这一项迁移为正常的顶层配置覆盖，未改其他插件配置。真实界面完成一次保持相同模型、语言和开关的保存，返回“已保存，新片段立即使用新配置”，写盘值已核对。

## 实际限制

自动化模型响应与 flush 监听器为 mock，不证明真实翻译质量、速率、计费或断电耐久性。本次尚未使用真实模型 API。未补译旧历史，也未自动重试旧的失败／半成品。长任务无条数上限后可能产生更多费用和排队，单次请求长度、输出与超时仍保留。

本机 rc.2 的接口核查不等于所有 rc.2 发行构建已验收。后续 DSH 更新、Session 格式迁移仍需要重新验证。

## 进度插件持续更新回归

0.2.0 默认沉默提醒为 180 秒，按用户“太快了”的反馈放弃每 4 步／60 秒方案。真实 Agent Loop 配合 mock 时钟与工具，验证 180 秒触发、600 秒配置不会提前触发、忽略提醒不会重置、reasoning 不算公开文字、实际公开文字重置、回合结束清除以及 Session 隔离。固定 5 次原有主模型请求，不增加请求。只验证提醒注入与调用数量，不能把 mock 模型输出当作真实模型遵从率证明。

## 0.2.1 表达研究与回归

核对 Codex 两套公开进度指引及模型模板的写作规则、Claude Code 官方输出风格扩展示例和文档，以及 DSH ReasoningRow、ReasoningContent 和适配器归一化链路，证据见 PROMPT-STYLE-RESEARCH.md。只调整默认文字引导和到期提醒，计时、Session 隔离及翻译逻辑不变。运行原有 44 项行为／集成测试及 Host／Client 类型检查，不为提示词措辞增加字符串镜像测试。未用真实模型比较自然度，测试通过不能证明所有模型都会采用目标语气。

本机已备份 0.2.0 并更新到 0.2.1 的插件文件与安装包，原有配置不变；未重启 DSH。历史公开回复不会被改写，是否热加载应以运行中的 DSH 为准。