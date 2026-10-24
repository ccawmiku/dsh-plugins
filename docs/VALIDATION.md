# 验证记录

日期：2026-10-23 UTC。环境：Linux x86-64，Node `24.19.0`；官方 DSH 固定 SHA `22ddee3792402c3e70ec5f86a63c3e3e895a2f60`。以下是实际完成的检查，不代表真实桌面或真实模型验证。

## 最终结果

| 检查 | 结果 |
| --- | --- |
| `npm run build` | 通过：2 个 Node ESM Host 包、1 个官方 lazy-CJS 格式浏览器入口 |
| `npm run typecheck` | 通过：Host／Client 独立严格 TS 程序，包含源码与对应测试；使用实际上游 API 类型 |
| `npm run pack` | 通过：2 个 `.tgz`，包括必要提示词、客户端入口、元数据、源码与许可；附 SHA256SUMS |
| `npm test` | **6 个测试文件，34 项通过** |
| `npm run check` | 上述构建 → 类型 → 打包 → 测试的完整链通过 |
| 解包后的构建产物加载 | 通过：从真正 npm `.tgz` 解包，再加载 `lib/index.js` 挂载到真实 Cordis／DSH 服务；不是仅测试 src |
| 浏览器包注册 | 通过：VM 检查只注册 factory，materialize 后得到插件出口，React 走既有模块 |
| 上游工作树 | `git status --short` 无改动；未修改 DSH 核心 |

开发前先安装了上游所需依赖，执行其 `scripts/generate-typert.ts` 生成 33 个 Remote 等构建产物，并用官方项目引用编译 `vendor/loader` 与 `packages/client/ui-chat/tsconfig.client.json`。直接把全部上游源码放进单个 TS 程序会混合 Host／Client 的 `Context.sessions`，也会漏掉 Remote 生成与 CSS 声明；已按真实双程序结构解决，没有用 `@ts-ignore`、伪接口或屏蔽项目诊断来假称通过。

公开 npm `@deepseek-ai/schemastery@3.18.5` 包也已下载检查，存在本插件使用的 `.volatile()` 能力。未运行安装生命周期脚本；交付包没有 postinstall／prepare 副作用。

## 自动化检查覆盖

- 真正 Agent Loop＋mock 模型＋无害工具：工具前自然文本／工具调用／工具结果／最终回答的顺序与持久保存；进度插件只使用原本两次主模型请求。
- required 上下文在 complete persona、关闭可选上下文时仍存在；插件卸载撤销注册；可以禁用，无需任何模型服务；自定义提示词的字面花括号不被错误插值。
- 公开 reasoning 独立翻译：不同 provider／model，辅助输入没有完整用户上下文、最终答案或工具；原文保留，译文不进 deriveMessages。
- 源段完成前的实时段落接纳；block-end-only 模型；权威 block-end 去重；长度上限；不拆 UTF-16 代理对；截断后可见限额提示。
- 串行队列、总队列上限、入队时确定来源顺序；持久化请求／flush 在模型派发之前；存储失败不调用模型。
- 取消、停用、超时以及忽略 AbortSignal 的 mock adapter；结果未知不自动重试；空／超长／错误／截断／tool-call 响应不标为成功；异常消息中模拟的敏感值不落日志记录。
- 真实 ConversationNodeAssembler 的 live append、JSON 刷新重放和单一 key 更新；译文节点位于过程折叠之外；坏记录和未知版本忽略。
- 实际 npm 包内容、兼容元数据、独立提示词路径、构建后 Host 导出以及 lazy-CJS 客户端注册。

## 严格区分的限制

- 没有使用真实模型 API、用户凭证或真实 Agent 任务测试；没有检验服务商账单、真实速率与翻译质量。
- 没有启动用户 DSH 桌面端，没有 GUI／浏览器自动化；不能声称桌面安装、布局、所有语言字体已经验收。
- 集成测试中的模型回复与 Session flush 监听器是 mock。它验证顺序与调用条件，不证明生产 JSONL／数据库的断电耐久性。底层存储长期卡住的 flush 由其实现负责，插件不会跳过日志直接调用模型。
- 没有声称支持 npm 当前旧版 `0.0.1-rc.1` 或所有未来 DSH。测试绑定源码 SHA，尤其是实验性插件记录格式与扩展 UI 类型。
- 本地源码／打包加载通过不等于经过用户真实 profile 的安装管理器或真实桌面程序验证；README 已给出对应验收步骤。
- 研发验证未执行生产部署、上游 GitHub 推送、自动合并、定时任务或外部监控；后续交付上传仅涉及独立项目仓库。
