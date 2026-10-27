window.__ModuleLoader__.load({id:"dsh-video-input",factory:(require)=>{var module={exports:{}};var exports=module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.js
var client_exports = {};
__export(client_exports, {
  VideoIcon: () => VideoIcon,
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);
var import_react2 = require("react");

// src/settings.js
var import_react = require("react");
var fields = [
  ["enabled", "checkbox", "\u542F\u7528\u89C6\u9891\u5904\u7406", "Enable video processing"],
  ["autoFallback", "checkbox", "\u4E0D\u652F\u6301\u65F6\u81EA\u52A8\u62BD\u5E27", "Automatically fall back to frames"],
  ["maxVideos", "number", "\u89C6\u9891\u6570\u91CF\u4E0A\u9650\uFF08\u542B\u5386\u53F2\uFF09", "Video limit including history", 1, 64],
  ["maxVideoBytes", "number", "\u5355\u89C6\u9891\u5927\u5C0F\u4E0A\u9650\uFF08MiB\uFF09", "Per-video size limit (MiB)", 1, 2047, 1, 1048576],
  ["maxDirectBytes", "number", "\u76F4\u4F20\u603B\u5927\u5C0F\u4E0A\u9650\uFF08MiB\uFF09", "Direct-upload total limit (MiB)", 1, 512, 1, 1048576],
  ["maxFrames", "number", "\u62BD\u5E27\u603B\u6570\u91CF\u4E0A\u9650", "Total frame limit", 1, 20],
  ["frameInterval", "number", "\u76EE\u6807\u91C7\u6837\u95F4\u9694\uFF08\u79D2\uFF09", "Target sample interval (seconds)", 0.1, 3600, 0.1],
  ["frameWidth", "number", "\u62BD\u5E27\u56FE\u7247\u5BBD\u5EA6", "Frame width", 128, 2048],
  ["frameCacheEntries", "number", "\u62BD\u5E27\u7F13\u5B58\u6761\u76EE\u6570", "Frame cache entries", 0, 128],
  ["timeoutMs", "number", "\u5904\u7406\u8D85\u65F6\uFF08\u79D2\uFF09", "Processing timeout (seconds)", 1, 1800, 1, 1e3],
  ["ffmpegPath", "text", "FFmpeg \u8DEF\u5F84", "FFmpeg path"],
  ["ffprobePath", "text", "FFprobe \u8DEF\u5F84", "FFprobe path"]
];
function ConfigPanel({ view, form, language }) {
  const en2 = !String(language?.() ?? "zh").startsWith("zh");
  const [draft, setDraft] = (0, import_react.useState)({}), [dirty, setDirty] = (0, import_react.useState)(false), [saving, setSaving] = (0, import_react.useState)(false), [notice, setNotice] = (0, import_react.useState)("");
  const revision = (0, import_react.useRef)(void 0);
  const state = form?.state;
  (0, import_react.useEffect)(() => {
    if (state?.status !== "ready" || dirty) return;
    setDraft({ ...state.value });
    revision.current = state.revision;
  }, [state?.revision, state?.status, dirty]);
  if (view === "summary") return (0, import_react.createElement)("span", null, en2 ? "Video upload and automatic frame fallback settings" : "\u89C6\u9891\u4E0A\u4F20\u3001\u81EA\u52A8\u62BD\u5E27\u4E0E\u5927\u5C0F\u9650\u5236\u8BBE\u7F6E");
  if (!form || state?.status !== "ready") return (0, import_react.createElement)("p", { role: "status" }, en2 ? "Configuration is unavailable. Enable the plugin and try again." : "\u914D\u7F6E\u6682\u4E0D\u53EF\u7528\uFF0C\u8BF7\u542F\u7528\u63D2\u4EF6\u540E\u91CD\u8BD5\u3002");
  const change = (key, value) => {
    setDraft((old) => ({ ...old, [key]: value }));
    setDirty(true);
    setNotice("");
  };
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      const ok = await form.mutate(Object.entries(draft).map(([key, value]) => ({ op: "set", path: [key], value })), revision.current);
      if (ok) {
        setDirty(false);
        setNotice(en2 ? "Saved. Applies to the next video request." : "\u5DF2\u4FDD\u5B58\uFF0C\u4ECE\u4E0B\u4E00\u6B21\u89C6\u9891\u8BF7\u6C42\u751F\u6548\u3002");
      } else setNotice(en2 ? "Could not save; the configuration may have changed. Reopen this page and try again." : "\u4FDD\u5B58\u5931\u8D25\uFF0C\u914D\u7F6E\u53EF\u80FD\u5DF2\u88AB\u5176\u4ED6\u7A97\u53E3\u4FEE\u6539\uFF1B\u8BF7\u91CD\u65B0\u6253\u5F00\u672C\u9875\u540E\u91CD\u8BD5\u3002");
    } catch (_error) {
      setNotice(en2 ? "Could not save. Please try again." : "\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002");
    } finally {
      setSaving(false);
    }
  };
  const inputStyle = { padding: "8px 10px", border: "1px solid var(--dsw-alias-border-l4)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)", font: "inherit", width: "100%", boxSizing: "border-box" };
  return (0, import_react.createElement)(
    "form",
    { onSubmit: save, style: { display: "grid", gap: 16, maxWidth: 600, color: "var(--dsw-alias-label-primary)" } },
    ...fields.map(([key, type, zh2, label, min, max, step = 1, scale = 1]) => (0, import_react.createElement)(
      "label",
      { key, style: { display: "grid", gap: 6 } },
      (0, import_react.createElement)("span", null, en2 ? label : zh2),
      (0, import_react.createElement)("input", {
        type,
        value: type === "checkbox" ? void 0 : type === "number" ? draft[key] === void 0 ? "" : draft[key] / scale : draft[key] ?? "",
        checked: type === "checkbox" ? Boolean(draft[key]) : void 0,
        disabled: saving || !state.writable,
        required: type !== "checkbox",
        min,
        max,
        step: type === "number" ? step : void 0,
        style: type === "checkbox" ? { justifySelf: "start" } : inputStyle,
        onChange: (event) => change(key, type === "checkbox" ? event.target.checked : type === "number" ? Math.round(Number(event.target.value) * scale * 10) / 10 : event.target.value)
      })
    )),
    (0, import_react.createElement)("p", { style: { color: "var(--dsw-alias-label-secondary)", margin: 0 } }, en2 ? "Frame fallback omits audio. FFmpeg and FFprobe must be installed on the DSH host." : "\u62BD\u5E27\u6A21\u5F0F\u4E0D\u5305\u542B\u58F0\u97F3\u3002FFmpeg \u4E0E FFprobe \u9700\u8981\u5B89\u88C5\u5728\u8FD0\u884C DSH \u540E\u7AEF\u7684\u8BBE\u5907\u4E0A\u3002"),
    (0, import_react.createElement)("button", { type: "submit", disabled: saving || !dirty || !state.writable, style: { ...inputStyle, width: "fit-content", cursor: "pointer" } }, saving ? en2 ? "Saving\u2026" : "\u4FDD\u5B58\u4E2D\u2026" : en2 ? "Save" : "\u4FDD\u5B58"),
    notice ? (0, import_react.createElement)("p", { role: "status" }, notice) : null
  );
}

// src/client.js
var NS = "videoInput";
var zh = { add: "\u6DFB\u52A0\u89C6\u9891", description: "\u4E0A\u4F20\u591A\u4E2A\u89C6\u9891\uFF0C\u968F\u95EE\u9898\u4E00\u8D77\u53D1\u9001\u7ED9\u5F53\u524D\u6A21\u578B", invalid: "\u8BF7\u9009\u62E9 MP4\u3001MOV\u3001WebM\u3001MKV\u3001AVI\u3001MPEG\u30013GP \u6216 WMV \u89C6\u9891\u3002", unavailable: "\u5F53\u524D\u5BF9\u8BDD\u6682\u65F6\u65E0\u6CD5\u6DFB\u52A0\u89C6\u9891\uFF0C\u8BF7\u7B49\u5F85\u53D1\u9001\u5B8C\u6210\u540E\u91CD\u8BD5\u3002", failure: "\u89C6\u9891\u672A\u80FD\u52A0\u5165\u9644\u4EF6\u533A\uFF0C\u8BF7\u91CD\u8BD5\u3002" };
var en = { add: "Add videos", description: "Attach multiple videos to the current model", invalid: "Choose MP4, MOV, WebM, MKV, AVI, MPEG, 3GP or WMV videos.", unavailable: "This conversation cannot accept videos now. Try again after submission.", failure: "Could not attach the videos. Please try again." };
var inject = ["slots", "commandUi", "conversation", "sessions", "locale"];
var extensions = /\.(mp4|m4v|mov|webm|mkv|avi|mpeg|mpg|3gp|wmv)$/i;
function VideoIcon({ size = 16 }) {
  return (0, import_react2.createElement)(
    "svg",
    { viewBox: "0 0 24 24", width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: 1.6, "aria-hidden": true },
    (0, import_react2.createElement)("rect", { x: 3, y: 6, width: 12, height: 12, rx: 3 }),
    (0, import_react2.createElement)("path", { d: "m15 10 6-4v12l-6-4M7 10l4 2-4 2z" })
  );
}
function apply(ctx) {
  const pickers = /* @__PURE__ */ new Map();
  ctx.effect(() => ctx.locale.register(NS, { zh, en }));
  const t = ctx.locale.bind(NS);
  const bindings = () => ctx.get("sessions");
  function VideoPicker({ useSession }) {
    const id = useSession((session) => session?.sessionId);
    const input = (0, import_react2.useRef)(null), selectedBinding = (0, import_react2.useRef)(null);
    (0, import_react2.useEffect)(() => {
      if (!id) return;
      const open = () => {
        selectedBinding.current = bindings().binding(id);
        input.current?.click();
      };
      pickers.set(id, open);
      return () => {
        if (pickers.get(id) === open) pickers.delete(id);
      };
    }, [id]);
    const onChange = (event) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = "";
      const binding = selectedBinding.current;
      if (!binding || binding !== bindings().binding(id) || !files.length) return;
      const conversation = ctx.get("conversation");
      const shell = conversation.input.for(binding.ctx);
      if (files.some((file) => !extensions.test(file.name))) {
        shell.notify("error", t("invalid"));
        return;
      }
      let drafts;
      try {
        drafts = conversation.createDrafts(id, files, true);
        if (!shell.addAttachments(drafts.map((draft) => draft.id))) {
          for (const draft of drafts) conversation.releaseDraftAttachment(draft.id);
          shell.notify("error", t("unavailable"));
        }
      } catch (_error) {
        for (const draft of drafts ?? []) conversation.releaseDraftAttachment(draft.id);
        shell.notify("error", t("failure"));
      }
    };
    return (0, import_react2.createElement)("input", { ref: input, type: "file", multiple: true, hidden: true, accept: ".mp4,.m4v,.mov,.webm,.mkv,.avi,.mpeg,.mpg,.3gp,.wmv", onChange, "aria-label": t("add"), "data-dsh-video-picker": "" });
  }
  ctx.slots.inject("conversation.input.left", () => ctx.slots.register({ name: "conversation.input.left", id: "video-picker" }, VideoPicker));
  ctx.slots.inject("plugins.row.config", () => ctx.slots.register({
    name: "plugins.row.config",
    key: "dsh-video-input#dsh-video-input",
    inject: () => ({ language: () => ctx.locale.getSnapshot().active })
  }, ConfigPanel));
  ctx.effect(() => ctx.commandUi.register({
    name: "video",
    label: () => t("add"),
    description: () => t("description"),
    icon: VideoIcon,
    available: ({ sessionId }) => {
      const binding = bindings().binding(sessionId);
      return pickers.has(sessionId) && binding?.session.getSnapshot().subagent === null && !["adjudicating", "submitting"].includes(ctx.conversation.input.for(binding.ctx).state.getSnapshot().phase);
    },
    ui: { kind: "action", run: ({ sessionId }) => pickers.get(sessionId)?.() }
  }));
  ctx.effect(() => () => pickers.clear());
}
return module.exports;}});
