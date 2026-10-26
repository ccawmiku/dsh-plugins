# 实现与边界

## 宿主与界面

`src/index.mjs` 是 Cordis host 半，依赖 `llm`、`connection`、`attachments`。所有接口注册到 DSH 共享 `/api/salon/*`，沿用桌面/网页宿主的身份验证。POST 额外要求 `x-salon-client: 1`。不另开未鉴权公网服务。

`client/index.jsx` 经 esbuild 打包成 `window.__ModuleLoader__.load({id,factory})`，React 从宿主 module table 解析。侧栏 `sidebar.panellist` 和主面板 `main` 注册同一个 `salon` key。页面没有凭据输入框或真实凭据响应。

## 发言与调度

每个会话拥有一个可取消任务；群聊与不同私聊可分别运行。点名优先，普通消息按主动程度选一人，视频/「都说两句」可选全员。视频第一轮先分别构建上下文、并行生成感受，之后进入持续自然接话，避免第一位角色的判断成为其余人的唯一视频来源。

持续接话不读旧的 `followUpTurns` 设置，也没有固定的轮数或整场时长上限。每次有新发言，先给最新消息点名的成员机会，再按主动程度选择其他成员。角色可以直接发言，或返回内部 `[沉默]`。一个人的沉默只跳过本人，直到当前发言之后的其他可用成员都不再补充，才自然结束；新发言会清空这一轮的沉默记录。完全重复该角色最近发言的内容不重复发布，作为没有新补充处理。模型故障单独记录，不能冒充成员主动选择结束。

用户可在同一群聊任务中插话与 @，不打断正在生成的一句话；排队点名优先处理，后续请求读取新消息。整理记忆期间收到的新消息等待任务结束再发起下一轮，避免收到后没有人回答。私聊仍是一对一回复，不会为了连续讨论引入其他角色。

`shared/chat.mjs` 同时供 host 与 client 使用，负责成员点名识别、输入框补全查询、沉默标记及说话内容清理。点名支持多成员、`@全体`/`@所有人`，避开邮件地址与相似长名字误命中。说话清理在每次流式更新和最终落盘前执行，删除中英文嵌套/未闭合括号内容；内部记忆 JSON 不经过该清理。

30 秒检查一次主动聊天时间。只有开关打开、至少一名角色有模型、没有任务、非安静时段且达到下一次时间才触发一次。下一次时间先落盘，再生成，避免重启补发一串旧事件。没有服务器外部常驻任务，宿主关闭即停止。

消息和任务错误分开：失败消息带 `error`，不会作为已经发生的正常对话注入模型。取消不会把尚未完成的输出写成正式发言。

## 记忆隔离

`context.mjs` 是唯一 prompt 组装入口。公开群聊只选择 `scope=group` 的个人记忆；角色私聊选择公开记忆和 `scope=dm:<本角色ID>`。访问其他角色私聊直接拒绝。日记不自动拼进 prompt；私聊情绪也不会通过一个全局 mood 字段渗入群聊。

每次交流后，由参与角色分别整理少量记忆和一段日记。来源 ID 必须出现在本次提供的真实记录中，输出不符合 JSON 或来源校验则不写入。核心人设不接受自动记忆任务改写。

长期记忆召回使用本地分词/关键词，不假称语义向量检索。常驻记忆始终保留，但仍遵守可见范围。当前没有自动解决相互矛盾的旧记忆，用户可在界面编辑/删除。

## 上下文压缩

目标 `contextTokens=500000`；查询 `llm.resolveModelInfo()` 后按模型容量取较小值，预留输出、媒体和安全空间。所有计数是保守估算，界面展示目标、模型披露容量、输入估算和媒体预留。

接近阈值后，对同一会话的摘要任务串行执行。摘要记录 `throughId`、本批 `sourceIds` 和 `previousId`，只替代模型请求里的早期原文，不删除磁盘原记录。以后只合并旧摘要和新覆盖的消息，不反复用摘要冒充原始事实。失败不更新边界。人设、置顶记忆、最近单条消息仍超限时明确拒绝，不能静默丢弃。

群摘要属于群；私聊摘要属于各自私聊。用户可以修订摘要或回退版本。最新消息列表分页展示，不限制模型历史读取范围。

## 本地视频

导入使用流式请求，单文件 1 GiB 上限；UUID 目录由程序生成，保存原件并用 FFprobe 验证视频流。FFmpeg 使用参数数组和 `shell:false`，不拼接用户命令。媒体读取只接受已经入库的 ID、固定原件/音频/封面名或元数据里登记的帧名，支持 Range 和 HEAD。

`ModelGateway` 的直传使用 DSH provider 目录与配置字段解析原生 endpoint 和 credential ref；真实凭据只在 host 解析。小文件提交 `inlineData` 视频 MIME 和字节；大文件走同源 resumable Files API，状态 ACTIVE 后才生成。错误响应移除实际凭据。原生方式不调用抽帧逻辑。

抽帧生成按时序标注的图片，经过 `attachments.saveImage`，再走 `llm.stream`。声音转写从真实音轨生成，并按视频/接口/模型缓存。缺少音轨或没有配置原生转写通道时明确标注，允许手动补字幕。字幕转写不是对视频的统一评价，各角色仍各自判断。

## 当前限制

- 不抓取抖音或 B 站，不调用 bili-whale 平台互动接口；借鉴其生活感、人设和日记思路。
- Gemini 原生通道使用非流式 `generateContent`，处理期间显示观看中，返回后显示完整发言；DSH 文字/图片通道流式显示。
- 中转接口必须支持对应原生路径；大文件还要求同源 Files API。跨域上传地址不会携带凭据继续发送。
- MOV/MKV/AVI 是否能在浏览器内播放取决于浏览器解码能力；FFmpeg 可读取不代表浏览器一定能预览。
- 单进程本地数据存储，不支持多个 DSH 实例同时写同一数据目录。演示、集成测试和正式数据隔离。
- 摘要和长期记忆由模型生成，可能遗漏或理解错误，保留原文与编辑/回退能力便于修正。
- 当前头像使用可编辑 emoji / URL，没有自动生成立绘、配音或 Live2D。

## 参考

- [DSH LLM streaming](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/llm-streaming.md)
- [Gemini video understanding](https://ai.google.dev/gemini-api/docs/video-understanding)
- [SillyTavern group chats](https://docs.sillytavern.app/usage/core-concepts/groupchats/)
- [SillyTavern World Info](https://github.com/SillyTavern/SillyTavern-Docs/blob/main/Usage/worldinfo.md)
- [SillyTavern summaries](https://docs.sillytavern.app/extensions/summarize/)
