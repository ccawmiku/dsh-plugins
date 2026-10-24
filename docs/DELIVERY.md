# 交付清单

- `packages/dsh-progress-commentary/`：独立 Host 插件、可编辑提示词、上游原文节选与来源／许可。
- `packages/dsh-reasoning-translation/`：独立 Host／Client 插件、限额队列、显示记录格式、模型输出检查、聊天流渲染。
- `dist/`：两个已构建 npm 安装包与 SHA256SUMS。
- `README.md`：中文安装、配置、启用、停用、卸载、升级限制与本地验收。
- `docs/RESEARCH.md`：固定 SHA 的 Codex／Claude Code／DSH 源码证据及架构取舍。
- `docs/VALIDATION.md`：实际检查结果与未验证部分。
- `docs/baselines.json`：机器可读的上游提交与版本记录。
- `examples/`、`scripts/`、`tests/`、`package-lock.json`：可复现配置、构建／检查与 34 项测试。

本仓库包含源码、文档、构建产物及 dist/ 安装包，不包含 node_modules、缓存、真实凭证或整个上游仓库。用户已创建并授权上传至私有仓库 https://github.com/ccawmiku/dsh-conversation-plugins ，交付分支为 main。仓库包含两个插件的完整源码、研究与验证文档、预构建产物和 dist/ 安装包。未向上游或无关仓库推送。
