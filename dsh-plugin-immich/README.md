# dsh-plugin-immich

适用于 **DeepSeek Harness (DSH)** 的内网 **Immich** 相册集成插件。

支持从内网 Immich 实例按时间线瀑布流浏览照片与视频、通过 CLIP 机器学习或文件名模糊搜索、批量多选，并一键添加进 DSH 对话框输入区。针对视频输入，提供**优先直传模型**与**视频转多帧切片**双模式切换。

---

## 🌟 核心特性

- **对话框无缝集成**：
  - **加号菜单**：在对话框底部的加号「`+`」菜单中直接提供「Immich 相册」入口（支持输入 `/immich` 斜杠命令直接唤起）。
  - **快捷按钮**：输入框左侧工具栏内嵌快捷相机图标，支持一键直达相册。
- **类似原生相册的浏览体验**：
  - **时间线瀑布流**：自动按拍摄/创建时间倒序加载媒体资产。
  - **极致加载优化**：浏览时加载轻量低延迟的 `thumbnail`，添加对话框时才拉取原图/高清文件，内网流畅不卡顿。
  - **智能与文件名搜索**：支持 Immich 的 CLIP 机器学习自然语言搜图（如搜索“猫咪”、“海边日落”），同时支持文件名精准/模糊检索。
  - **全屏沉浸预览（Lightbox）**：双击或点击放大镜，可在相册内全屏预览高清晰大图，并支持原视频内嵌播放。
  - **批量多选**：右上角勾选框支持多选，一键批量把多张照片或视频打包加入输入框。
- **视频输入双模式切换**：
  - **🚀 优先直接传给模型 (Direct Pass-through)**：原视频文件直接附入对话，由原生支持多模态视频的模型（如 Gemini 1.5 Pro / Flash 等）直接理解。
  - **🎞️ 使用视频转多帧图片 (Video to Multi-frame Images)**：利用 FFmpeg 均匀抽取序列关键帧图片，作为图片集合送入模型上下文。
  - **实时切换**：除了在设置面板配置默认策略外，相册选择器顶部提供实时切换药丸按钮，针对单次任务灵活应对。
- **设置面板**：
  - 在 DSH 设置页和相册选择器内均提供配置面板，支持 Immich Server URL 配置、API Key 安全脱敏存储、一键网络连通性测试。

---

## 🔑 Immich API Key 权限要求 (Scopes)

为了最大程度保障您的 Immich 数据安全，本插件**仅需要纯只读权限**。在 Immich 网页端创建 API Key 时，请按如下配置：

### 推荐开启的权限项：
| 权限项 (Scope) | 是否必需 | 说明 |
| :--- | :---: | :--- |
| **`asset.read`** | **必需** | 读取媒体资产列表、时间线、图片/视频元数据 |
| **`asset.download`** | **必需** | 下载原图、视频以及生成高清缩略图 |
| **`search.read`** | **必需** | 使用 CLIP 机器学习智能搜图与文件名搜索 |
| **`album.read`** | 可选 | 预留相册列表读取权限 |

> ⚠️ **安全提示**：
> - **切勿勾选** `asset.write`、`asset.delete`、`asset.share` 或管理员 (Admin) 权限。
> - 插件全程不包含任何删除、修改、分享资产的逻辑。

---

## 🛠️ 安装与启用

### 方式一：在本地 DSH 实例中直接启用（开发调试）

1. 克隆或下载本仓库到本地目录，例如：
   ```bash
   git clone https://github.com/<your-username>/dsh-plugin-immich.git
   cd dsh-plugin-immich
   npm install
   npm run build
   ```

2. 在您的 DSH profile（通常位于 `~/.dsh/profiles/desktop/package.json`）的 `dependencies` 中添加软链接：
   ```json
   "dependencies": {
     "dsh-plugin-immich": "link:/path/to/dsh-plugin-immich"
   }
   ```
   并在 `dsh.profile.bundles` 中加入：
   ```json
   "bundles": [
     "...",
     "dsh-plugin-immich"
   ]
   ```

3. 重启或刷新 DSH Web 客户端即可生效。

---

## ⚙️ 配置说明

在相册弹窗右上角的齿轮按钮或 DSH 设置中心找到 **Immich 相册** 配置项：

1. **Immich 服务器地址**：例如 `http://192.168.1.21:2283`（不需要末尾斜杠）。
2. **Immich API Key**：填入上述生成的只读 API Key。
3. **点击「⚡ 测试连通性」**：若提示连接成功并展示 Immich 版本号，即表示配置就绪。
4. **视频默认处理策略**：
   - `直传模型 (Direct)`：直接提交原视频文件。
   - `切帧多图 (Frames)`：自动切帧，并可调整最大提取帧数（默认 12 帧）与采样间隔（默认 2 秒）。

---

## 📄 License

MIT License
