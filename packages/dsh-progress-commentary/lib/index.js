// packages/dsh-progress-commentary/src/index.ts
import { readFileSync } from "node:fs";
import z from "@deepseek-ai/schemastery";
var defaultPolicy = readFileSync(new URL("../prompts/commentary.md", import.meta.url), "utf8").trim();
var Config = z.object({
  enabled: z.boolean().default(true).description("\u542F\u7528\u4E3B\u6A21\u578B\u81EA\u7136\u8BED\u8A00\u8FDB\u5EA6\u8BF4\u660E").volatile(),
  language: z.string().default("\u8DDF\u968F\u7528\u6237\u672C\u8F6E\u4F7F\u7528\u7684\u8BED\u8A00").description("\u8FDB\u5EA6\u8BF4\u660E\u7684\u8BED\u8A00").volatile(),
  instructions: z.string().default(defaultPolicy).description("\u8FDB\u5EA6\u89C4\u5219\uFF1B\u7559\u7A7A\u65F6\u4E0D\u6CE8\u5165").volatile(),
  intervalSeconds: z.natural().min(30).max(86400).default(180).description("\u8FDE\u7EED\u6CA1\u6709\u516C\u5F00\u8FDB\u5EA6\u7684\u63D0\u9192\u95F4\u9694\uFF08\u79D2\uFF09\uFF1B\u9ED8\u8BA4 3 \u5206\u949F\uFF0C\u4EC5\u5728\u4E0B\u4E00\u6B21\u6A21\u578B\u54CD\u5E94\u524D\u63D0\u9192").volatile()
});
var inject = ["systemPrompt"];
function apply(ctx, config) {
  const activity = /* @__PURE__ */ new WeakMap();
  ctx.on("session/event", (session, event) => {
    if (event.type === "turn/start") activity.set(session, { turn: event.data.turn, lastTextAt: Date.now() });
    else if (event.type === "turn/end") activity.delete(session);
    else if (event.type === "assistant/message") {
      if (event.data.message.content.some((block) => block.type === "text" && block.text.trim())) {
        activity.set(session, { turn: event.data.turn, lastTextAt: Date.now() });
      }
    }
  });
  ctx.effect(() => ctx.systemPrompt.context({
    name: "dsh-progress-commentary",
    order: 700,
    required: true,
    interpolate: false,
    text: ({ agent }) => {
      if (!config.enabled.get()) return "";
      const policy = config.instructions.get().trim();
      if (!policy) return "";
      const state = agent && activity.get(agent.session);
      const due = state && Date.now() - state.lastTextAt >= config.intervalSeconds.get() * 1e3;
      const reminder = due ? "\n\nProgress update due: the user has not heard from you for a while. Give one short, natural update grounded in the work so far: a useful finding, a changed approach, a blocker, or the question you are resolving and why it matters. Group related checks instead of announcing individual reads, searches or commands. If there is no new result, say what remains unresolved without inventing progress. Continue with the actual tools if needed; if finished, answer normally. Do not mention the reminder or elapsed interval." : "";
      return `${policy}

Commentary language preference: ${config.language.get()}${reminder}`;
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
