# 迁移核验

每个项目默认分支的原始 Git tree 与导入子目录 tree 完全一致，见 manifest.json。所有原分支保存在 archive/<原仓库名>/<原分支>，原标签保存在 <原仓库名>/<原标签>。原始提交 SHA 保留，未压缩历史。

issues、PR 元数据、评论和 release 元数据按项目导出为 JSON；release 附件保存于 release-assets。它们是历史档案，不会自动变为新库中的活跃 issue / PR。原库没有删除或修改可见性。
