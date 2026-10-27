# 进度说明与公开思考翻译的共享验证工程

两个插件已分别移至仓库根目录：

- [dsh-progress-commentary](../../dsh-progress-commentary/README.md)
- [dsh-reasoning-translation](../../dsh-reasoning-translation/README.md)

此目录保留跨插件集成测试、类型检查、历史研究资料和打包验证，不是一个可安装的 DSH 插件。

```sh
npm ci --ignore-scripts
npm run check
```

默认从本仓库相邻的 `dsh-upstream` 目录读取官方 DSH 源码；其他路径可设置 `DSH_SOURCE`。验证基线保持为官方 `0.2.1-rc.3`，检查不启动用户的桌面 profile。

插件也可在各自目录单独构建和打包。
