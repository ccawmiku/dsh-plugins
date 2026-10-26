# 迁移核验

每个项目默认分支的原始 Git tree 与导入子目录 tree 完全一致，见 manifest.json。所有原分支保存在 archive/<原仓库名>/<原分支>，原标签保存在 <原仓库名>/<原标签>。原始提交 SHA 保留，未压缩历史。

issues、PR 元数据、评论和 release 元数据按项目导出为 JSON；release 附件保存于 release-assets。它们是历史档案，不会自动变为新库中的活跃 issue / PR。原库没有删除或修改可见性。

导入核验提交之后，当前插件 README 和沙龙 package.json 的仓库链接已适配到集合仓库；原始 tree 和源分支仍完整保留。私有仓库需先认证克隆，再按子目录使用本地安装。
