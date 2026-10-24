// packages/dsh-progress-commentary/src/index.ts
import { readFileSync } from "node:fs";
import z from "@deepseek-ai/schemastery";
var defaultPolicy = readFileSync(new URL("../prompts/commentary.md", import.meta.url), "utf8").trim();
var Config = z.object({
  enabled: z.boolean().default(true).description("\u542F\u7528\u4E3B\u6A21\u578B\u81EA\u7136\u8BED\u8A00\u8FDB\u5EA6\u8BF4\u660E").volatile(),
  language: z.string().default("\u8DDF\u968F\u7528\u6237\u672C\u8F6E\u4F7F\u7528\u7684\u8BED\u8A00").description("\u8FDB\u5EA6\u8BF4\u660E\u7684\u8BED\u8A00").volatile(),
  instructions: z.string().default(defaultPolicy).description("\u8FDB\u5EA6\u89C4\u5219\uFF1B\u7559\u7A7A\u65F6\u4E0D\u6CE8\u5165").volatile()
});
var inject = ["systemPrompt"];
function apply(ctx, config) {
  ctx.effect(() => ctx.systemPrompt.context({
    name: "dsh-progress-commentary",
    order: 700,
    required: true,
    interpolate: false,
    text: () => {
      if (!config.enabled.get()) return "";
      const policy = config.instructions.get().trim();
      if (!policy) return "";
      return `${policy}

Commentary language preference: ${config.language.get()}`;
    }
  }));
}
export {
  Config,
  apply,
  defaultPolicy,
  inject
};
//# sourceMappingURL=index.js.map
