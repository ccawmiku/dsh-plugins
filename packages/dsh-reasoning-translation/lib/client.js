window.__ModuleLoader__.load({ id: "dsh-reasoning-translation", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
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

// packages/dsh-reasoning-translation/src/client.ts
var client_exports = {};
__export(client_exports, {
  TranslationRowView: () => TranslationRowView,
  apply: () => apply,
  inject: () => inject,
  translationDefinition: () => translationDefinition
});
module.exports = __toCommonJS(client_exports);
var import_react = require("react");

// packages/dsh-reasoning-translation/src/records.ts
var REQUEST = "plugin:dsh-reasoning-translation/request";
var RESULT = "plugin:dsh-reasoning-translation/result";
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

// packages/dsh-reasoning-translation/src/client.ts
var NS = "dshReasoningTranslation";
var zh = {
  title: "\u601D\u8003\u8BD1\u6587",
  original: "\u67E5\u770B\u516C\u5F00\u539F\u6587",
  pending: "\u7FFB\u8BD1\u5DF2\u6392\u961F\uFF0F\u53D1\u8D77\uFF0C\u7ED3\u679C\u5F85\u786E\u8BA4\uFF1B\u4E0D\u4F1A\u81EA\u52A8\u91CD\u8BD5\u3002",
  failed: "\u7FFB\u8BD1\u5931\u8D25\uFF1B\u516C\u5F00\u539F\u6587\u4ECD\u53EF\u67E5\u770B\u3002",
  cancelled: "\u7FFB\u8BD1\u5DF2\u53D6\u6D88\u3002",
  unconfirmed: "\u7FFB\u8BD1\u8D85\u65F6\uFF0C\u670D\u52A1\u7AEF\u7ED3\u679C\u672A\u77E5\uFF1B\u4E0D\u4F1A\u81EA\u52A8\u91CD\u8BD5\u3002",
  limited: "\u5DF2\u8FBE\u7FFB\u8BD1\u8C03\u7528\u6216\u961F\u5217\u4E0A\u9650\uFF1B\u540E\u7EED\u516C\u5F00\u601D\u8003\u672A\u7FFB\u8BD1\u3002"
};
var en = {
  title: "Reasoning translation",
  original: "View public original",
  pending: "Translation queued/requested; result unconfirmed. No automatic retry.",
  failed: "Translation failed. The public original is still available.",
  cancelled: "Translation cancelled.",
  unconfirmed: "Translation timed out; server outcome unknown. No automatic retry.",
  limited: "Translation call or queue limit reached. Later public reasoning was not translated."
};
var translationDefinition = {
  kind: "dsh-reasoning-translation",
  target: "chat",
  match(event) {
    const record = parseRecord(event);
    if (!record) return null;
    return { id: record.data.id, role: record.kind === "result" ? "update" : "start" };
  },
  start(_context, match) {
    const record = parseRecord(match.event);
    if (!record || record.kind === "result") throw new Error("Translation row requires a request or limit notice");
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
    return record?.kind === "result" ? { ...context.state, status: record.data.status, text: record.data.text } : context.state;
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
  const body = d.status === "translated" ? d.text : t(d.status);
  return (0, import_react.createElement)(
    "section",
    {
      "data-dsh-reasoning-translation": d.status,
      style: { margin: "8px 0", padding: "8px 12px", borderInlineStart: "2px solid currentColor", opacity: 0.85 }
    },
    (0, import_react.createElement)("small", null, `${t("title")}${d.model ? ` \xB7 ${d.provider} / ${d.model} \xB7 ${d.language}` : ""}`),
    (0, import_react.createElement)("div", { style: { whiteSpace: "pre-wrap", overflowWrap: "anywhere" } }, body),
    d.source ? (0, import_react.createElement)(
      "details",
      null,
      (0, import_react.createElement)("summary", null, t("original")),
      (0, import_react.createElement)("pre", { style: { whiteSpace: "pre-wrap", overflowWrap: "anywhere" } }, d.source)
    ) : null
  );
}
var inject = ["uiConversation", "slots", "locale"];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { en, zh }));
  ctx.effect(() => ctx.uiConversation.events.register(translationDefinition));
  ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
    name: "conversation.chat.node",
    key: "dsh-reasoning-translation",
    locale: NS
  }, TranslationRowView));
}
return module.exports; } });
//# sourceMappingURL=client.js.map
