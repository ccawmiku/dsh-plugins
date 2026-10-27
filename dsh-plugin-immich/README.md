# dsh-plugin-immich

在 DSH 对话中浏览内网 Immich 照片与视频，支持时间线、搜索、多选、高清预览，并将素材加入当前对话的原生附件区。添加后仍需手动发送消息。

## 使用

- 从输入框快捷按钮、加号菜单的「Immich 相册」或 `/immich` 打开相册。
- 搜索支持三种方式：**自动**优先智能搜图，不可用或首次没有匹配时回退到文件名；**智能搜图**仅使用 CLIP；**文件名**绕过机器学习服务。翻页保持已提交的搜索词与搜索方式。
- 勾选可跨搜索、跨分页保留，按勾选顺序添加。关闭相册或在相册中保存设置后清空选择。
- 预览图片使用 Immich 生成的高清预览，避免浏览器无法显示 HEIC 等原图；视频使用原文件，代理保留 Range 请求和 206/416 响应以支持拖动播放。视频能否播放仍取决于浏览器对原文件编码的支持。
- 附件加入**打开相册时的会话**，不通过页面文件控件查找；与视频输入插件共用时不会误选它的上传框。原会话被关闭、重新绑定或正在发送时会提示重试。

## 环境与安装

- Node.js ≥24.9。
- DSH `0.2.1-rc.2` / `0.2.1-rc.3`。附件接入使用已核查的 `ConversationController.createDrafts(sessionId, files, true)` 与 `SessionInput.addAttachments()`；这些接口尚未稳定，因此限定兼容版本。
- Immich 接口按 [v2.0 DTO](https://github.com/immich-app/immich/blob/v2.0.0/server/src/dtos/search.dto.ts) 与 [当前官方 DTO](https://github.com/immich-app/immich/blob/main/server/src/dtos/search.dto.ts) 核对，使用仍受支持的 page/size 分页字段。
- 切帧模式需要在**运行 DSH 后端的设备**上安装 `ffmpeg` 并加入 PATH。直传和浏览相册不需要 FFmpeg。

从此集合仓库构建安装包：

```sh
git clone https://github.com/ccawmiku/dsh-plugins.git
cd dsh-plugins/dsh-plugin-immich
npm ci
npm test
npm pack
```

`npm pack` 会自动构建，生成 `dsh-plugin-immich-0.1.1.tgz`。桌面版通过插件管理器安装本地包；Web / CLI 示例：

```sh
dsh plugin --profile web add /绝对路径/dsh-plugin-immich-0.1.1.tgz
```

按安装提示刷新或重启 DSH。

## 配置与只读权限

在 DSH 设置页或相册齿轮按钮中填写服务器地址和 API Key。网络访问由 DSH 后端发起，浏览器无需直连 Immich；容器部署时请确认 DSH 容器可以访问该地址。

服务器地址接受 `http://192.168.1.21:2283`；自动补全省略的 `http://`、去除末尾斜杠和可选的 `/api`。仅支持 HTTP(S)，拒绝 URL 内嵌用户名密码、查询参数和片段。HTTPS 保持证书验证；跨服务器重定向会被阻止，请填写最终服务器地址。

创建 Immich API Key 时，仅需以下只读权限：

| 权限 | 用途 |
| --- | --- |
| `asset.read` | 时间线、文件名搜索、智能搜索和资产信息 |
| `asset.view` | 缩略图与高清预览 |
| `asset.download` | 原图、原视频、视频抽帧 |

依据官方 [搜索路由](https://github.com/immich-app/immich/blob/main/server/src/controllers/search.controller.ts) 和 [媒体路由](https://github.com/immich-app/immich/blob/main/server/src/controllers/asset-media.controller.ts)。不需要 `search.read`、`album.read` 或写入、删除、分享、管理权限。

密钥字段留空表示保留已存密钥；输入新值会替换；「清除已保存 API Key」在保存后生效。测试连接会实际调用需要鉴权的只读接口，不会仅凭公开的版本接口就报告密钥有效。

配置保存在 DSH 服务端 `${DSH_HOME:-~/.dsh}/storages/dsh-immich/config.json`，也可由插件的 `dataDirectory` 指定目录。密钥以明文存于配置文件，**不是加密存储**；写入采用临时文件与原子替换，POSIX 下目录/文件权限分别为 0700/0600，Windows 沿用目录 ACL。读取配置时只向浏览器返回固定掩码，不返回密钥前后缀。旧版本若已把掩码保存成密钥，需要重新输入真实 Key。

## 视频策略

- **直传模型**：原视频作为 DSH 附件上传。此插件负责选取和附加素材；发送时是否支持视频由 DSH、视频输入插件和当前模型/网关决定。需要直传适配或自动回退时，可配合同仓库的 [dsh-video-input](../dsh-video-input/README.md)。
- **切帧多图**：在服务端下载视频到临时文件并用 FFmpeg 生成 JPEG，不将整个源视频读入服务端内存。长视频在帧数限制下增大采样间隔，分散覆盖视频；极短视频也至少尝试抽取一帧。结果仅包含静态画面，不包含声音。

| 配置项 | 默认 | 范围 |
| --- | ---: | --- |
| `pageSize` | 60 | 1–200 |
| `maxFrames` | 12 | 1–30 |
| `frameInterval` | 2 秒 | 0.5–60 秒 |

最大帧数是上限，短视频可能少于该数量。单个原文件请求超时 120 秒，FFmpeg 进程超时 120 秒；单次切帧接口总超时 300 秒。处理期间可点「取消添加」取消请求；处理完成、失败或取消都会清理抽帧临时目录。添加失败保留勾选，方便重试。原文件添加与帧图片最终仍需在浏览器及 DSH 附件流程中占用相应内存，大批量或大文件需留意设备容量。

## 开发与验证

```sh
npm ci
npm test
npm run build
npm pack --dry-run
```

测试包括配置保留/更换/清除、并发保存与损坏文件保护、真实 HTTP 模拟服务、分页与搜索回退、Range 流代理、重定向密钥保护、原生附件接口及释放、React 交互和插件卸载。安装 FFmpeg 时还会实际合成视频，验证极短视频与长视频抽帧；未安装时只跳过该项。CI 安装 FFmpeg 并执行全部测试、构建与打包检查。

这些测试不需要访问私人相册或调用付费模型；不等同于已在用户的 DSH + Immich 实例完成端到端验收。

## 0.1.1

修复重复保存设置损坏密钥、搜索翻页混入时间线、跨搜索勾选漏加、上传控件冲突、视频 Range 丢失和超短视频抽帧为空等问题；补充参数校验、请求取消、插件卸载清理、只读权限说明与自动化验证。

MIT License.
