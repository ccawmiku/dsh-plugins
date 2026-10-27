window.__ModuleLoader__.load({ id: "dsh-reasoning-translation", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.ts
var client_exports = {};
__export(client_exports, {
  TranslationRowView: () => TranslationRowView,
  apply: () => apply,
  inject: () => inject,
  translationDefinition: () => translationDefinition
});
module.exports = __toCommonJS(client_exports);
var import_react2 = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// src/records.ts
var REQUEST = "plugin:dsh-reasoning-translation/request";
var RESULT = "plugin:dsh-reasoning-translation/result";
var PROGRESS = "plugin:dsh-reasoning-translation/progress";
var NOTICE = "plugin:dsh-reasoning-translation/notice";
function object(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function coordinate(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}
function string(value, max) {
  return typeof value === "string" && value.length <= max;
}
function parseRecord(event) {
  if (!object(event) || event.ignorable !== true || !coordinate(event.seq) || !object(event.data)) return;
  const d = event.data;
  if (d.version !== 1 || !string(d.id, 512) || !d.id) return;
  const seq = event.seq;
  if (event.type === PROGRESS) {
    if (d.status !== "translating" || !string(d.text, 262144)) return;
    return { kind: "progress", seq, data: { version: 1, id: d.id, status: "translating", text: d.text } };
  }
  if (event.type === RESULT) {
    if (!["translated", "failed", "cancelled", "unconfirmed"].includes(String(d.status)) || !string(d.text, 262144)) return;
    return { kind: "result", seq, data: { version: 1, id: d.id, status: d.status, text: d.text } };
  }
  if (!coordinate(d.turn) || !coordinate(d.step)) return;
  if (event.type === NOTICE && d.status === "limited") {
    return { kind: "notice", seq, data: { version: 1, id: d.id, turn: d.turn, step: d.step, status: "limited" } };
  }
  if (event.type !== REQUEST || !string(d.provider, 512) || !string(d.model, 512) || !string(d.language, 128) || !string(d.source, 32768) || !string(d.system, 32768) || !coordinate(d.maxTokens) || d.maxTokens < 1) return;
  return { kind: "request", seq, data: {
    version: 1,
    id: d.id,
    turn: d.turn,
    step: d.step,
    provider: d.provider,
    model: d.model,
    language: d.language,
    source: d.source,
    system: d.system,
    maxTokens: d.maxTokens
  } };
}

// src/settings.tsx
var import_react = __toESM(require("react"), 1);
var SETTINGS_NS = "dshReasoningTranslationSettings";
var ENTRY = "dsh-reasoning-translation";
var zh = {
  title: "\u601D\u8003\u7FFB\u8BD1",
  description: "\u628A\u516C\u5F00\u601D\u8003\u8BD1\u6210\u804A\u5929\u4E2D\u7684\u81EA\u7136\u6BB5\u843D\uFF0C\u968F\u5DE5\u5177\u8FC7\u7A0B\u6301\u7EED\u663E\u793A\u3002",
  enabled: "\u542F\u7528\u601D\u8003\u7FFB\u8BD1",
  model: "\u7FFB\u8BD1\u6A21\u578B",
  choose: "\u9009\u62E9\u5DF2\u914D\u7F6E\u7684\u6A21\u578B",
  manual: "\u624B\u52A8\u586B\u5199\u6A21\u578B",
  provider: "\u670D\u52A1\u5546\u8DEF\u7531",
  modelId: "\u6A21\u578B ID",
  language: "\u76EE\u6807\u8BED\u8A00",
  refresh: "\u5237\u65B0\u6A21\u578B\u5217\u8868",
  save: "\u4FDD\u5B58",
  saving: "\u6B63\u5728\u4FDD\u5B58\u2026",
  saved: "\u5DF2\u4FDD\u5B58\uFF0C\u65B0\u7247\u6BB5\u7ACB\u5373\u4F7F\u7528\u65B0\u914D\u7F6E\u3002",
  failed: "\u4FDD\u5B58\u5931\u8D25\u6216\u914D\u7F6E\u5DF2\u6539\u53D8\u3002\u8BF7\u68C0\u67E5\u5F53\u524D\u914D\u7F6E\u540E\u91CD\u8BD5\u3002",
  loading: "\u6B63\u5728\u8BFB\u53D6\u914D\u7F6E\u2026",
  unavailable: "\u63D2\u4EF6\u914D\u7F6E\u6682\u4E0D\u53EF\u7528\u3002",
  catalogFailed: "\u90E8\u5206\u6A21\u578B\u672A\u80FD\u8BFB\u53D6\uFF0C\u4ECD\u53EF\u624B\u52A8\u586B\u5199\u8DEF\u7531\u4E0E\u6A21\u578B ID\u3002",
  catalogLoading: "\u6B63\u5728\u8BFB\u53D6\u6A21\u578B\u5217\u8868\u2026",
  required: "\u8BF7\u586B\u5199\u670D\u52A1\u5546\u8DEF\u7531\u3001\u6A21\u578B ID \u548C\u76EE\u6807\u8BED\u8A00\u3002",
  note: "\u590D\u7528 DSH \u5DF2\u4FDD\u5B58\u7684\u670D\u52A1\u5546\u51ED\u8BC1\u3002\u7FFB\u8BD1\u4F1A\u4EA7\u751F\u989D\u5916\u6A21\u578B\u8BF7\u6C42\uFF1B\u4E0D\u9650\u5236\u7FFB\u8BD1\u6761\u6570\uFF0C\u6309\u987A\u5E8F\u5904\u7406\u6240\u6709\u65B0\u7247\u6BB5\u3002",
  current: "\u5F53\u524D\u6A21\u578B",
  missing: "\u5C1A\u672A\u9009\u62E9",
  reset: "\u64A4\u9500\u4FEE\u6539"
};
var en = {
  title: "Reasoning translation",
  description: "Translate public reasoning into narration alongside tool activity.",
  enabled: "Enable reasoning translation",
  model: "Translation model",
  choose: "Choose a configured model",
  manual: "Enter a model manually",
  provider: "Provider route",
  modelId: "Model ID",
  language: "Target language",
  refresh: "Refresh models",
  save: "Save",
  saving: "Saving\u2026",
  saved: "Saved. New fragments use these settings immediately.",
  failed: "Save failed or settings changed. Check the current configuration and retry.",
  loading: "Loading settings\u2026",
  unavailable: "Plugin settings are unavailable.",
  catalogFailed: "Some models could not be loaded. You can still enter the route and model ID.",
  catalogLoading: "Loading models\u2026",
  required: "Enter a provider route, model ID and target language.",
  note: "Uses credentials already saved in DSH. Translation adds model requests. All new fragments are queued without a count limit.",
  current: "Current model",
  missing: "None selected",
  reset: "Discard changes"
};
function routeKey(provider, model) {
  return JSON.stringify([provider, model]);
}
function preferenceOps(value) {
  return Object.entries({ enabled: value.enabled, provider: value.provider.trim(), model: value.model.trim(), targetLanguage: value.targetLanguage.trim() }).map(([key, value2]) => ({ op: "set", path: [key], value: value2 }));
}
var control = {
  width: "100%",
  boxSizing: "border-box",
  padding: "9px 12px",
  borderRadius: "8px",
  border: "1px solid var(--dsw-alias-border-primary, #555)",
  background: "var(--dsw-alias-interactive-bg-hover, transparent)",
  color: "inherit",
  font: "inherit"
};
var button = { ...control, width: "auto", cursor: "pointer" };
var field = { display: "grid", gap: "8px" };
function TranslationSettings({ form, loadModels, watchModels, t }) {
  const snapshot = (0, import_react.useSyncExternalStore)((0, import_react.useCallback)((listener) => form.subscribe(listener), [form]), (0, import_react.useCallback)(() => form.getSnapshot(), [form]));
  const [draft, setDraft] = (0, import_react.useState)(null);
  const [groups, setGroups] = (0, import_react.useState)([]);
  const [catalog, setCatalog] = (0, import_react.useState)("loading");
  const [refresh, setRefresh] = (0, import_react.useState)(0);
  const [saving, setSaving] = (0, import_react.useState)(false);
  const [message, setMessage] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => watchModels(() => setRefresh((n) => n + 1)), [watchModels]);
  (0, import_react.useEffect)(() => {
    let active = true;
    setCatalog("loading");
    void loadModels().then((result) => {
      if (!active) return;
      setGroups(result.groups);
      setCatalog(result.partial ? "partial" : "ready");
    }, () => {
      if (active) {
        setGroups([]);
        setCatalog("partial");
      }
    });
    return () => {
      active = false;
    };
  }, [loadModels, refresh]);
  if (snapshot.status !== "ready" || !snapshot.value) return /* @__PURE__ */ import_react.default.createElement("p", { role: "status" }, t(snapshot.status === "loading" ? "loading" : "unavailable"));
  const value = draft?.value ?? snapshot.value;
  const locked = !snapshot.writable || saving;
  const edit = (patch) => {
    setDraft({ value: { ...value, ...patch }, revision: draft?.revision ?? snapshot.revision });
    setMessage(null);
  };
  const known = groups.some((g) => g.id === value.provider && g.models.some((m) => m.id === value.model));
  const save = async () => {
    if (!draft || locked) return;
    if (value.enabled && (!value.provider.trim() || !value.model.trim() || !value.targetLanguage.trim())) {
      setMessage("required");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const accepted = await form.mutate(preferenceOps(value), draft.revision);
      if (accepted) {
        setDraft(null);
        setMessage("saved");
      } else setMessage("failed");
    } catch {
      setMessage("failed");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ import_react.default.createElement("form", { onSubmit: (event) => {
    event.preventDefault();
    void save();
  }, style: { display: "grid", gap: "24px", maxWidth: "680px", padding: "8px 0" } }, /* @__PURE__ */ import_react.default.createElement("header", null, /* @__PURE__ */ import_react.default.createElement("h2", { style: { margin: "0 0 8px", fontSize: "20px" } }, t("title")), /* @__PURE__ */ import_react.default.createElement("p", { style: { margin: 0, color: "var(--dsw-alias-label-secondary, #aaa)" } }, t("description"))), /* @__PURE__ */ import_react.default.createElement("label", { style: { display: "flex", gap: "10px", alignItems: "center" } }, /* @__PURE__ */ import_react.default.createElement("input", { type: "checkbox", checked: value.enabled, disabled: locked, onChange: (e) => edit({ enabled: e.target.checked }) }), t("enabled")), /* @__PURE__ */ import_react.default.createElement("div", { style: { color: "var(--dsw-alias-label-secondary, #aaa)", overflowWrap: "anywhere" } }, t("current"), " \xB7 ", value.model ? `${value.provider} / ${value.model}` : t("missing")), /* @__PURE__ */ import_react.default.createElement("label", { style: field }, t("model"), /* @__PURE__ */ import_react.default.createElement("select", { style: control, disabled: locked, value: known ? routeKey(value.provider, value.model) : "", onChange: (e) => {
    if (!e.target.value) return;
    const [provider, model] = JSON.parse(e.target.value);
    edit({ provider, model });
  } }, /* @__PURE__ */ import_react.default.createElement("option", { value: "" }, value.model ? t("manual") : t("choose")), groups.map((group) => /* @__PURE__ */ import_react.default.createElement("optgroup", { key: group.id, label: group.name }, group.models.map((model) => /* @__PURE__ */ import_react.default.createElement("option", { key: model.id, value: routeKey(group.id, model.id) }, model.name || model.id)))))), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("button", { type: "button", style: button, disabled: catalog === "loading", onClick: () => setRefresh((n) => n + 1) }, t("refresh")), catalog !== "ready" && /* @__PURE__ */ import_react.default.createElement("p", { role: "status" }, t(catalog === "loading" ? "catalogLoading" : "catalogFailed"))), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" } }, /* @__PURE__ */ import_react.default.createElement("label", { style: field }, t("provider"), /* @__PURE__ */ import_react.default.createElement("input", { style: control, value: value.provider, maxLength: 512, disabled: locked, onChange: (e) => edit({ provider: e.target.value }) })), /* @__PURE__ */ import_react.default.createElement("label", { style: field }, t("modelId"), /* @__PURE__ */ import_react.default.createElement("input", { style: control, value: value.model, maxLength: 512, disabled: locked, onChange: (e) => edit({ model: e.target.value }) }))), /* @__PURE__ */ import_react.default.createElement("label", { style: field }, t("language"), /* @__PURE__ */ import_react.default.createElement("input", { style: control, value: value.targetLanguage, maxLength: 128, disabled: locked, onChange: (e) => edit({ targetLanguage: e.target.value }) })), /* @__PURE__ */ import_react.default.createElement("p", { style: { margin: 0, color: "var(--dsw-alias-label-secondary, #aaa)", lineHeight: 1.7 } }, t("note")), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", gap: "12px" } }, /* @__PURE__ */ import_react.default.createElement("button", { type: "submit", style: button, disabled: !draft || locked }, t(saving ? "saving" : "save")), /* @__PURE__ */ import_react.default.createElement("button", { type: "button", style: button, disabled: !draft || saving, onClick: () => {
    setDraft(null);
    setMessage(null);
  } }, t("reset"))), message && /* @__PURE__ */ import_react.default.createElement("p", { role: message === "saved" ? "status" : "alert" }, t(message)));
}
function mountSettings(ctx) {
  ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }));
  const t = ctx.locale.bind(SETTINGS_NS);
  const face = {
    form: ctx.configForms.get(ENTRY),
    async loadModels() {
      const result = await ctx.remote.session.modelCatalog();
      if (!result.ok) throw new Error("Model catalog unavailable");
      return { groups: result.value.groups, partial: result.value.failures.length > 0 };
    },
    watchModels(refresh) {
      const off = [ctx.remote.$on("llm/adapters-updated", refresh), ctx.remote.$on("settings/document-updated", refresh), ctx.on("connection/reset", refresh)];
      return () => {
        for (const dispose of off) dispose();
      };
    }
  };
  ctx.effect(() => ctx.configForms.whileServed([ENTRY], () => ctx.slots.inject("settings.section", () => ctx.slots.register({
    name: "settings.section",
    id: ENTRY,
    order: 35,
    label: () => t("title"),
    locale: SETTINGS_NS,
    inject: () => face
  }, TranslationSettings))));
}

// src/client.ts
var NS = "dshReasoningTranslation";
var zh2 = {
  title: "\u601D\u8003\u8BD1\u6587",
  original: "\u67E5\u770B\u516C\u5F00\u539F\u6587",
  pending: "\u7B49\u5F85\u8BD1\u6587\u2026",
  failed: "\u7FFB\u8BD1\u5931\u8D25\uFF1B\u516C\u5F00\u539F\u6587\u4ECD\u53EF\u67E5\u770B\u3002",
  cancelled: "\u7FFB\u8BD1\u5DF2\u53D6\u6D88\u3002",
  unconfirmed: "\u7FFB\u8BD1\u8D85\u65F6\uFF0C\u670D\u52A1\u7AEF\u7ED3\u679C\u672A\u77E5\uFF1B\u4E0D\u4F1A\u81EA\u52A8\u91CD\u8BD5\u3002",
  limited: "\u5DF2\u8FBE\u7FFB\u8BD1\u8C03\u7528\u6216\u961F\u5217\u4E0A\u9650\uFF1B\u540E\u7EED\u516C\u5F00\u601D\u8003\u672A\u7FFB\u8BD1\u3002",
  copy: "\u590D\u5236",
  copied: "\u5DF2\u590D\u5236",
  footnotes: "\u811A\u6CE8",
  translating: "\u7FFB\u8BD1\u4E2D\u2026"
};
var en2 = {
  title: "Reasoning translation",
  original: "View public original",
  pending: "Waiting for translation\u2026",
  failed: "Translation failed. The public original is still available.",
  cancelled: "Translation cancelled.",
  unconfirmed: "Translation timed out; server outcome unknown. No automatic retry.",
  limited: "Translation call or queue limit reached. Later public reasoning was not translated.",
  copy: "Copy",
  copied: "Copied",
  footnotes: "Footnotes",
  translating: "Translating\u2026"
};
var translationDefinition = {
  kind: "dsh-reasoning-translation",
  target: "chat",
  match(event) {
    const record = parseRecord(event);
    if (!record) return null;
    return { id: record.data.id, role: record.kind === "result" || record.kind === "progress" ? "update" : "start" };
  },
  start(_context, match) {
    const record = parseRecord(match.event);
    if (!record || record.kind === "result" || record.kind === "progress") throw new Error("Translation row requires a request or limit notice");
    if (record.kind === "notice") return {
      id: record.data.id,
      seq: record.seq,
      turn: record.data.turn,
      step: record.data.step,
      provider: "",
      model: "",
      language: "",
      source: "",
      text: "",
      status: "limited"
    };
    const d = record.data;
    return {
      id: d.id,
      seq: record.seq,
      turn: d.turn,
      step: d.step,
      provider: d.provider,
      model: d.model,
      language: d.language,
      source: d.source,
      text: "",
      status: "pending"
    };
  },
  update(context, match) {
    const record = parseRecord(match.event);
    return record?.kind === "result" || record?.kind === "progress" ? { ...context.state, status: record.data.status, text: record.data.text } : context.state;
  },
  buildViewNode(context) {
    if (!context.state) return null;
    return {
      key: context.key,
      kind: "dsh-reasoning-translation",
      id: context.id,
      target: "chat",
      anchorSeq: context.state.seq,
      location: context.start?.location ?? context.matches[0]?.location ?? { kind: "unresolved" },
      visibility: "visible",
      groupTree: "turn",
      data: context.state
    };
  }
};
function TranslationRowView({ node, t }) {
  const d = node.data;
  const hasText = d.status === "translated" || d.status === "translating";
  const body = d.status === "translated" || d.status === "translating" ? d.text : t(d.status);
  const labels = (0, import_react2.useMemo)(() => ({ code: { copyLabel: t("copy"), copiedLabel: t("copied") }, footnotes: t("footnotes") }), [t]);
  const quiet = { color: "var(--dsw-alias-label-tertiary, #888)", fontSize: "12px", lineHeight: "20px" };
  return (0, import_react2.createElement)(
    "section",
    {
      "data-dsh-reasoning-translation": d.status,
      style: {
        margin: "12px 0 18px",
        minWidth: 0,
        overflowWrap: "anywhere",
        fontSize: "var(--dsh-content-font-size, 14px)",
        lineHeight: "calc(24px + var(--dsh-content-font-delta, 0px))",
        color: "var(--dsw-alias-label-primary, inherit)"
      }
    },
    hasText ? (0, import_react2.createElement)(import_dsh_client_ui_primitives.MarkdownText, { text: body, labels, streaming: d.status === "translating" }) : (0, import_react2.createElement)("div", { style: quiet, role: "status" }, body),
    d.source ? (0, import_react2.createElement)(
      "details",
      { style: { marginTop: "6px" } },
      (0, import_react2.createElement)("summary", {
        style: { ...quiet, cursor: "pointer", width: "fit-content" },
        title: t("original")
      }, d.status === "translating" ? `${t("translating")} \xB7 ${t("title")}` : t("title")),
      (0, import_react2.createElement)("div", { style: { ...quiet, marginTop: "8px" } }, `${d.provider} / ${d.model} \xB7 ${d.language}`),
      (0, import_react2.createElement)("pre", { style: {
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        fontFamily: "inherit",
        color: "var(--dsw-alias-label-secondary, #aaa)",
        margin: "6px 0",
        fontSize: "13px"
      } }, d.source)
    ) : null
  );
}
var inject = ["uiConversation", "slots", "locale"];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { en: en2, zh: zh2 }));
  ctx.effect(() => ctx.uiConversation.events.register(translationDefinition));
  ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
    name: "conversation.chat.node",
    key: "dsh-reasoning-translation",
    locale: NS
  }, TranslationRowView));
  ctx.inject(["configForms", "remote", "remote.session"], (child) => mountSettings(child));
}
return module.exports; } });
//# sourceMappingURL=client.js.map
