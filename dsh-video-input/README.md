# 视频输入 · dsh-video-input

在 DSH 输入框的「＋」菜单中增加 **添加视频**，支持一次选择多个本地视频，再输入问题一起发送。视频使用原生附件卡，保留上传进度、移除与失败重试；消息发送后原文件留在 DSH 的持久附件存储中，后续追问继续携带历史视频。

插件沿用**当前对话的模型、提供方、端点和凭据**，没有额外的 API key 设置，也不修改原有「文件」入口。普通文字、图片和其他文件消息不经过视频发送路径。

## 安装

从本目录的 [dist](dist/) 下载 `dsh-video-input-0.1.0.tgz`，使用桌面版的插件管理器安装本地包。若安装结果提示需要重启，按提示重启后再验证入口。

Web / CLI：

```sh
dsh plugin --profile web add /绝对路径/dsh-video-input-0.1.0.tgz
```

安装后在对话里点击「＋ → 添加视频」，可多选 MP4、MOV、WebM、MKV、AVI、MPEG、M4V、3GP 或 WMV。保持附件上传完成后，和文字一起点击发送。插件不会选完视频就自动发送。

## 直传与自动抽帧

直传使用 **Chat Completions 的 `video_url` 扩展**。该扩展不是所有 OpenAI 兼容接口都支持的统一标准。已在 Antigravity Manager `5.0.1-beta.1`、请求模型 `gemini-3.8-flash` 上验证画面、音轨、多视频及追问；网关返回的实际 Chat 路由名为 `gemini-3.8-flash-tiered`。

在当前连接使用其他协议、视频超过直传总大小上限，或接口明确拒绝视频媒体类型时，默认自动抽帧，并在回答前显示带明确插件标记的提示。帧附带时间信息，均匀覆盖视频首尾。**抽帧不包含声音**；插件也会将这个限制告知模型。

鉴权失败、限流、服务故障、网络中断和已经开始输出后的失败不会自动切换后再发一次请求，避免重复生成和重复计费。若接口静默丢弃媒体却仍返回成功，插件无法通用地自动识别；请选择已验证支持 `video_url` 的接口。

自动抽帧需要在 **运行 DSH 后端的设备** 上安装 `ffmpeg` 和 `ffprobe`，或在插件设置中填写它们的绝对路径；仅在浏览器设备上安装不够。缺失时会显示错误。原文件会保留，抽帧临时文件在处理完成或取消后清理。

## 配置

打开“插件 → 视频输入 → 包含的组件 → 配置 视频输入”调整参数。保存后从下一次视频请求起生效；已经开始的请求继续使用开始时的配置。关闭整个插件会立即取消它正在处理的视频请求。

| 字段 | 默认 | 含义 |
|---|---:|---|
| `enabled` | true | 启用视频处理 |
| `maxVideos` | 8 | 每次请求最多视频次数，含历史中的重复引用 |
| `maxVideoBytes` | 512 MiB | 单个源文件大小上限 |
| `maxDirectBytes` | 64 MiB | 全部直传视频的原始字节总上限，base64 后请求会更大 |
| `autoFallback` | true | 不支持直传时自动抽帧 |
| `maxFrames` | 8 | 所有视频合计最多采样帧数；多视频共同分配 |
| `frameInterval` | 2 秒 | 目标采样间隔，长视频受总帧数约束 |
| `frameWidth` | 1024 | 抽帧图片宽度 |
| `frameCacheEntries` | 16 | 内存中缓存的已完成抽帧结果数 |
| `timeoutMs` | 180000 | 单次处理和请求总超时 |
| `ffmpegPath` / `ffprobePath` | 命令名 | 抽帧程序路径 |

这些是插件限额，不代表模型和网关也接受相同大小。DSH 发送前的 token 估算仍按通用文件计算，视频实际用量以接口返回为准。视频会在追问时重新发送，可能增加输入 token 和延迟；历史自动压缩后，已离开有效模型上下文的视频不会被插件重新找回并插入。DSH 的通用文件附件不会自动删除，保留策略沿用 DSH。

## 兼容与实现

- 兼容声明：官方 DSH `0.2.1-rc.2` / `0.2.1-rc.3`，Node ≥24.9。
- 源码测试基线：官方提交 `22ddee3792402c3e70ec5f86a63c3e3e895a2f60`，`0.2.1-rc.3`。桌面和 Web 使用相同的客户端模块。
- 通过 `commandUi` 注册菜单，`conversation.input.left` 只挂载隐藏文件选择器，不替换原生附件区。
- 桌面普通文件路径入口可能只插入路径引用，本插件直接调用该版本的 `ConversationController.createDrafts()` 上传原文件，再通过公开的 `SessionInput.addAttachments()` 加入草稿。`createDrafts` 是已核查实现方法，未包含在最小的 `IConversation` 声明中；升级 DSH 后需要重验，故未声明宽泛版本兼容。
- 通过 `llm/stream` 处理已有、持久的 `FileBlock` 引用，不写入自定义 Session 事件，不把 base64 或凭据存入聊天记录。文件读回经过原生附件服务的完整性校验。
- 直传保留文字、图片、reasoning、工具调用 ID、流式输出与 token 用量；不新增或选择另一模型。Responses、Gemini 原生及其他协议当前通过抽帧委托给原有模型适配器。
- 停用会撤销监听器和菜单，取消视频处理。历史视频仍在原生文件存储中，停用后按普通文件显示。

## 开发与验证

```sh
npm ci --ignore-scripts
npm run build
npm test
npm run pack:plugin
```

默认从集合仓库相邻的 `dsh-upstream` 读取官方 DSH 源码，可用 `DSH_SOURCE` 指定其他路径。普通测试无需密钥，覆盖真实 Cordis Loader、附件存储、LLM runtime、拒绝直传后的 FFmpeg 回退，以及流式协议。

可选真实模型测试：仅在进程环境中设置 `DSH_VIDEO_TEST_URL`（以 `/v1` 结尾）和 `DSH_VIDEO_TEST_KEY`，再运行 `npm run test:live`。它会发送仓库自带的合成测试视频，产生模型调用。不要将密钥写入源码或提交到仓库。验证范围和结果见 [docs/VALIDATION.md](docs/VALIDATION.md)。

图标和测试视频为本项目原创，MIT 许可。接口依据 [DSH 官方源码](https://github.com/deepseek-ai/deepseek-harness) 与 [Antigravity 视频映射](https://github.com/lbjlaq/Antigravity-Manager/blob/v5.0.1-beta.1/src-tauri/src/proxy/video/mod.rs)。
