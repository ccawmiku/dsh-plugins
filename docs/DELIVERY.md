# 交付清单

- `packages/dsh-reasoning-translation/`：0.2.0 Host／Client 源码、设置页、翻译队列、流式记录及聊天 Markdown 渲染。
- `packages/dsh-progress-commentary/`：0.2.1 进度插件，保留 3 分钟提醒并优化自然表达。
- `dist/dsh-reasoning-translation-0.2.0.tgz`、`dist/dsh-progress-commentary-0.2.1.tgz` 与 SHA256SUMS。
- 根 README、examples、docs/VALIDATION.md：安装、配置、升级、43 项测试和实测边界。
- docs/RESEARCH.md 与 baselines.json：早期架构研究及固定上游版本。
- tests 与 scripts：包括 Windows 路径／npm 打包支持的可复现检查。

源码、构建产物与安装包保存在私有仓库 ccawmiku/dsh-conversation-plugins。不包含 node_modules、缓存、凭证、用户会话或上游完整源码。
