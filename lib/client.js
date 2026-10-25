window.__ModuleLoader__.load({id:"dsh-salon",factory:function(require){var module={exports:{}};var exports=module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
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

// client/index.jsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);
var import_react2 = __toESM(require("react"), 1);

// client/app.jsx
var import_react = __toESM(require("react"), 1);

// client/styles.js
var css = `
.salon .composer-wrap{position:relative}.salon .mention-menu{position:absolute;bottom:calc(100% + 6px);left:30px;right:30px;max-height:310px;overflow:auto;border:1px solid #65516d;border-radius:13px;background:#262130;box-shadow:0 10px 40px #0005;z-index:20;padding:6px}.salon .mention-menu button{display:flex;align-items:center;gap:12px;width:100%;padding:9px 12px;background:transparent;text-align:left;border-radius:8px}.salon .mention-menu button.selected,.salon .mention-menu button:hover{background:#44334d}.salon .mention-menu strong{display:block;font-size:12px;font-weight:500;color:#e4c8e6}.salon .mention-menu small{display:block;font-size:10px}.salon .mention-hint{padding:7px 12px;color:#93829f;font-size:10px;display:block}
.salon{--bg:#14141c;--panel:#1c1c27;--panel2:#242331;--line:#ffffff0e;--text:#ece7ee;--muted:#9992a6;--pink:#e6afbd;--accent:#cfacdb;display:flex;height:100%;min-height:580px;background:var(--bg);color:var(--text);font:14px/1.6 "Segoe UI","Microsoft YaHei",sans-serif;overflow:hidden;color-scheme:dark;box-sizing:border-box}
.salon *{box-sizing:border-box}.salon button,.salon input,.salon select,.salon textarea{font:inherit}.salon button{cursor:pointer;color:inherit;border:0}.salon button:disabled{opacity:.45;cursor:wait}.salon button:focus-visible,.salon a:focus-visible{outline:2px solid var(--pink);outline-offset:3px}.salon input,.salon select,.salon textarea{width:100%;color:var(--text);background:#15151f;border:1px solid #ffffff17;border-radius:10px;padding:10px 12px;outline:none}.salon textarea{resize:vertical;min-height:90px}.salon input:focus,.salon textarea:focus,.salon select:focus{border-color:var(--accent)}.salon h1,.salon h2,.salon h3,.salon p{margin:0}.salon small{color:var(--muted)}
.salon .rail{width:232px;flex-shrink:0;background:#191822;border-right:1px solid var(--line);display:flex;flex-direction:column;padding:28px 16px 16px}.salon .brand{padding:0 12px 26px}.salon .brand-mark{color:var(--pink);font-size:27px;letter-spacing:4px}.salon .brand h1{font-size:21px;font-weight:550;letter-spacing:4px;margin-top:8px}.salon .brand p{font-size:11px;letter-spacing:2px;color:var(--muted);margin-top:3px}.salon .nav-label{padding:18px 12px 7px;font-size:10px;letter-spacing:2px;color:#766e83}.salon .room-button{display:flex;gap:12px;align-items:center;text-align:left;width:100%;padding:12px;border-radius:12px;background:transparent;margin:3px 0;color:#b5aebf}.salon .room-button:hover{background:#ffffff05}.salon .room-button.active{background:#342a3b;color:#f1d5df}.salon .room-button strong{font-size:13px;font-weight:550;display:block}.salon .room-button small{font-size:10px;display:block;max-width:133px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.salon .nav-footer{margin-top:auto;border-top:1px solid var(--line);padding-top:13px;display:grid;gap:5px}.salon .subtle{background:transparent;color:var(--muted);padding:9px 12px;border-radius:8px;text-align:left}.salon .subtle:hover{background:#ffffff08;color:var(--text)}
.salon .avatar{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:38px;height:38px;border-radius:13px;background:color-mix(in srgb,var(--role,#b391c7) 14%,#22212a);border:1px solid color-mix(in srgb,var(--role,#b391c7) 25%,transparent);font-size:20px}.salon .avatar.large{width:58px;height:58px;font-size:29px;border-radius:20px}.salon .avatar img{width:100%;height:100%;object-fit:cover;border-radius:inherit}.salon .room-dot{margin-left:auto;width:6px;height:6px;background:var(--pink);border-radius:50%}
.salon .main{flex:1;min-width:0;display:flex;flex-direction:column;position:relative;background:radial-gradient(ellipse at 50% 0%,#30243525,transparent 60%)}.salon .topbar{height:89px;flex-shrink:0;border-bottom:1px solid var(--line);padding:20px 32px;display:flex;align-items:center;justify-content:space-between;gap:12px}.salon .topbar h2{font-size:18px;font-weight:500;letter-spacing:1px}.salon .topbar p{font-size:11px;color:var(--muted);margin-top:3px}.salon .top-actions{display:flex;gap:8px;align-items:center}.salon .pill{font-size:10px;color:#c1afcc;background:#b391c710;padding:5px 10px;border:1px solid #b391c721;border-radius:20px;white-space:nowrap}.salon .pill.on{color:#adc9b3;background:#9cba9d0a;border-color:#9cba9d23}.salon .icon-button{background:transparent;color:var(--muted);padding:7px 9px;border-radius:8px;font-size:17px}.salon .icon-button:hover{background:#ffffff08;color:var(--text)}
.salon .chat-scroll{flex:1;min-height:0;overflow:auto;padding:22px 32px;scrollbar-width:thin;scrollbar-color:#48404f transparent}.salon .empty{max-width:550px;margin:55px auto 30px;text-align:center}.salon .empty .eyebrow{font-size:11px;letter-spacing:4px;color:var(--pink);margin-bottom:16px}.salon .empty h2{font-size:28px;font-weight:400;letter-spacing:3px;margin-bottom:12px}.salon .empty p{color:var(--muted);font-size:13px;line-height:2}.salon .portraits{display:flex;justify-content:center;gap:16px;margin:28px 0}.salon .portraits button{background:none;transition:transform .2s}.salon .portraits button:hover{transform:translateY(-5px)}.salon .prompts{display:flex;gap:9px;justify-content:center;flex-wrap:wrap;margin-top:26px}.salon .chip{background:#24212e;border:1px solid #ffffff0b;color:#c3b5ce;border-radius:10px;padding:9px 13px;font-size:11px}.salon .chip:hover{border-color:#bf93c855}.salon .onboarding{background:#2d2532;border:1px solid #e6afbd30;padding:14px 18px;border-radius:12px;color:#e2c6d2;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:12px;margin-bottom:20px}
.salon .message{display:flex;gap:12px;margin:0 0 22px;align-items:flex-start;max-width:90%}.salon .message.user{margin-left:auto;flex-direction:row-reverse;max-width:85%}.salon .message .meta{display:flex;align-items:center;gap:9px;color:#c6bbcd;font-size:11px;margin:0 0 6px 2px}.salon .message .meta time{font-size:10px;color:#736b7d}.salon .message.user .meta{justify-content:flex-end}.salon .bubble{border-radius:3px 15px 15px 15px;background:#24222e;padding:12px 16px;font-size:13px;line-height:1.9;white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid #ffffff04}.salon .user .bubble{background:#3a2c40;border-radius:15px 3px 15px 15px}.salon .message.error .bubble{background:#38262c;color:#e7b4b9;border-color:#b66d7433}.salon .message.system{max-width:100%;opacity:.8}.salon .transport{margin-top:6px;font-size:10px;color:#9b8ca7}.salon .typing{opacity:.7}.salon .typing-dots{letter-spacing:4px;color:var(--pink)}.salon .chat-video{display:block;background:#15141c;border:1px solid #ffffff0b;width:220px;text-align:left;padding:0;border-radius:9px;overflow:hidden;margin-bottom:8px}.salon .chat-video img{width:100%;height:120px;object-fit:cover;opacity:.85}.salon .chat-video span{display:block;padding:8px 10px;font-size:11px}.salon .load-history{display:block;margin:0 auto 24px}
.salon .composer-wrap{padding:0 30px 22px;flex-shrink:0}.salon .composer{border:1px solid #514058;background:#201e2a;border-radius:16px;overflow:hidden}.salon .composer textarea{border:0;background:transparent;resize:none;min-height:65px;max-height:180px;padding:15px 17px;font-size:13px}.salon .composer:focus-within{border-color:#aa83b5}.salon .composer textarea:focus{border:0}.salon .composer-tools{display:flex;align-items:center;gap:10px;padding:6px 12px 10px}.salon .composer-tools small{font-size:10px}.salon .spacer{flex:1}.salon .primary{background:#d9b2d7;color:#2d2030;border-radius:9px;padding:9px 18px;font-weight:600;font-size:12px}.salon .primary:hover{background:#e6c6e4}.salon .secondary{background:#35303f;color:#dbcfe2;border-radius:9px;padding:9px 13px;font-size:12px}.salon .danger{background:#4d2b35;color:#e7bbc5;border-radius:9px;padding:9px 15px}.salon .check-inline{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted)}.salon .check-inline input{width:auto;accent-color:#c9a0d2}.salon .attachment-strip{display:flex;align-items:center;gap:8px;font-size:11px;color:#c8b4d0;padding:8px 15px;border-bottom:1px solid var(--line)}.salon .composer-note{font-size:10px;color:#746b7e;margin:9px 2px 0;display:flex;justify-content:space-between;gap:10px}.salon .alert{margin:0 30px 12px;padding:10px 14px;border:1px solid #ba78843d;background:#36232c;color:#e1b3bf;font-size:12px;border-radius:9px;display:flex;gap:10px;align-items:center}
.salon .aside{width:256px;flex-shrink:0;border-left:1px solid var(--line);padding:27px 20px;overflow:auto;background:#19182070}.salon .aside-label{color:var(--muted);font-size:11px;letter-spacing:2px;margin-bottom:18px}.salon .character-card{padding:15px 0;border-bottom:1px solid var(--line)}.salon .character-row{display:flex;gap:11px;align-items:center}.salon .character-row strong{font-size:13px;font-weight:500}.salon .character-row small{display:block;font-size:10px}.salon .character-card p{color:#9c92a7;font-size:11px;margin:11px 0}.salon .card-actions{display:flex;gap:8px}.salon .card-actions button{background:transparent;color:#b5a0c1;font-size:11px;padding:2px 0}.salon .aside-note{font-size:11px;line-height:1.9;color:#7d728a;margin-top:22px}.salon .status-row{font-size:10px;color:#92829f;margin-top:20px}.salon .memory-link{font-size:11px;color:#b99bc8;background:transparent;padding:3px 0}
.salon .modal-overlay{position:absolute;inset:0;background:#090810b8;backdrop-filter:blur(8px);z-index:30;display:flex;align-items:center;justify-content:center;padding:24px}.salon .modal{background:#201e2a;border:1px solid #ffffff14;border-radius:18px;width:min(830px,100%);max-height:94%;display:flex;flex-direction:column;box-shadow:0 20px 100px #0006}.salon .modal-head{padding:22px 25px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line)}.salon .modal-head h2{font-size:18px;font-weight:500;letter-spacing:1px}.salon .modal-body{padding:22px 25px;overflow:auto;min-height:0}.salon .modal-footer{padding:15px 25px;display:flex;align-items:center;justify-content:flex-end;gap:10px;border-top:1px solid var(--line)}.salon .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.salon .field{display:block;font-size:11px;color:#c0b2cb}.salon .field>span{display:block;margin-bottom:7px}.salon .field small{display:block;margin-top:5px;font-size:10px;color:#85788f}.salon .full{grid-column:1/-1}.salon .section-title{font-size:13px;font-weight:500;letter-spacing:1px;margin:25px 0 15px;padding-top:20px;border-top:1px solid var(--line);color:#d2b4d8}.salon .section-title:first-child{margin-top:0;padding-top:0;border:0}.salon .toggle-field{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0}.salon .toggle-field input{width:17px;height:17px;accent-color:#cfacdb}.salon .toggle-field strong{display:block;font-size:12px;font-weight:400}.salon .toggle-field small{font-size:10px}.salon .tabs{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}.salon .tabs button{background:#292532;padding:8px 13px;border-radius:8px;font-size:12px;color:#9f91ad}.salon .tabs button.active{color:#ead0e8;background:#48354e}.salon .memory-entry{padding:14px 0;border-bottom:1px solid var(--line)}.salon .memory-entry p{white-space:pre-wrap;font-size:12px;margin:7px 0;line-height:1.9}.salon .memory-entry summary{color:#8e809b;font-size:10px;cursor:pointer}.salon .memory-tags{display:flex;gap:8px;align-items:center;font-size:10px;color:#b69fc3}.salon .memory-actions{display:flex;gap:12px}.salon .memory-actions button{font-size:10px;padding:2px 0;background:transparent;color:#b19abb}.salon .empty-small{color:#92839f;font-size:12px;padding:30px 0;text-align:center}.salon .video-library{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:16px}.salon .video-tile{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#18151f}.salon .video-tile img{width:100%;height:130px;object-fit:cover}.salon .video-tile .content{padding:12px}.salon .video-tile h3{font-size:12px;overflow-wrap:anywhere}.salon .video-tile p{font-size:10px;color:var(--muted);margin:4px 0 10px}.salon .video-tile button{margin:3px 5px 0 0}.salon video{max-width:100%;max-height:52vh;border-radius:10px;background:black}.salon .demo-banner{font-size:11px;background:#453227;color:#e7c8a5;padding:6px 15px;text-align:center}.salon .loading{margin:auto;color:#c3a4cd;font-size:14px}.salon .inline-stat{font-size:10px;color:#9e86ac}.salon .toast{position:absolute;bottom:150px;left:50%;transform:translateX(-50%);z-index:60;padding:11px 18px;background:#403249;border:1px solid #7b5e84;border-radius:10px;font-size:12px;max-width:80%}
@media(min-width:1500px){.salon .chat-scroll{padding:28px 55px}.salon .composer-wrap{padding-left:55px;padding-right:55px}.salon .aside{width:290px}.salon .rail{width:248px}}@media(max-width:1100px){.salon .aside{display:none}.salon .rail{width:210px}.salon .topbar{padding:18px 22px}.salon .chat-scroll{padding:20px 22px}}@media(max-width:720px){.salon .rail{width:76px;padding:20px 8px}.salon .brand{padding:0 3px 12px;text-align:center}.salon .brand h1,.salon .brand p,.salon .nav-label,.salon .room-button .room-text,.salon .nav-footer .nav-text{display:none}.salon .brand-mark{font-size:22px;letter-spacing:0}.salon .room-button{justify-content:center;padding:10px 0}.salon .room-dot{display:none}.salon .topbar{padding:14px;height:78px}.salon .topbar h2{font-size:15px}.salon .topbar .pill{display:none}.salon .chat-scroll{padding:20px 12px}.salon .composer-wrap{padding:0 12px 14px}.salon .message{max-width:100%;gap:8px}.salon .message .avatar{width:30px;height:30px;font-size:17px;border-radius:10px}.salon .bubble{padding:10px 12px}.salon .form-grid{grid-template-columns:1fr}.salon .modal-overlay{padding:10px}.salon .modal-body{padding:18px}.salon .empty h2{font-size:23px}.salon .portraits{gap:5px}.salon .composer-note span:last-child{display:none}.salon .alert{margin-left:12px;margin-right:12px}}
`;

// shared/chat.mjs
function mentionQuery(value, caret) {
  const prefix = value.slice(0, caret);
  const match = /(?:^|[\s，。！？、：:；;「『（(])@([^@\s，。！？、：:；;」』）)]*)$/u.exec(prefix);
  if (!match) return null;
  const start = prefix.lastIndexOf("@");
  return { start, end: caret, query: match[1] };
}

// client/app.jsx
var modes = [["auto", "\u81EA\u52A8\u9009\u62E9"], ["native", "\u539F\u89C6\u9891\u76F4\u4F20"], ["frames", "\u62BD\u5E27 + \u58F0\u97F3\u8F6C\u5199"]];
async function request(path, options) {
  const response = await fetch("/api/salon/" + path, { ...options, headers: { ...options?.body instanceof File ? {} : { "content-type": "application/json" }, "x-salon-client": "1", ...options?.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `\u8BF7\u6C42\u5931\u8D25 ${response.status}`);
  return data;
}
var act = (body) => request("action", { method: "POST", body: JSON.stringify(body) });
var mediaURL = (id, part = "poster") => "/api/salon/media?id=" + encodeURIComponent(id) + "&part=" + encodeURIComponent(part);
var clock = (at) => new Date(at).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
var quantity = (n) => n >= 1e3 ? (n / 1e3).toFixed(n % 1e3 ? 1 : 0) + "k" : String(n);
function Avatar({ character, large = false }) {
  const avatar = character?.avatar || "\u2727";
  return /* @__PURE__ */ import_react.default.createElement("span", { className: "avatar" + (large ? " large" : ""), style: { "--role": character?.color } }, /^https?:\/\//.test(avatar) ? /* @__PURE__ */ import_react.default.createElement("img", { src: avatar, alt: character?.name || "", referrerPolicy: "no-referrer" }) : avatar);
}
function Modal({ title, children, footer, close }) {
  const ref = (0, import_react.useRef)();
  (0, import_react.useEffect)(() => {
    const previous = document.activeElement;
    const handle = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const elements = [...ref.current.querySelectorAll("button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]")];
        const first = elements[0], last = elements.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handle);
    ref.current.querySelector("button")?.focus();
    return () => {
      document.removeEventListener("keydown", handle);
      previous?.focus();
    };
  }, []);
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "modal-overlay", onMouseDown: (e) => {
    if (e.target === e.currentTarget) close();
  } }, /* @__PURE__ */ import_react.default.createElement("section", { ref, className: "modal", role: "dialog", "aria-modal": "true", "aria-label": title }, /* @__PURE__ */ import_react.default.createElement("header", { className: "modal-head" }, /* @__PURE__ */ import_react.default.createElement("h2", null, title), /* @__PURE__ */ import_react.default.createElement("button", { className: "icon-button", "aria-label": "\u5173\u95ED", onClick: close }, "\xD7")), /* @__PURE__ */ import_react.default.createElement("div", { className: "modal-body" }, children), footer && /* @__PURE__ */ import_react.default.createElement("footer", { className: "modal-footer" }, footer)));
}
function Field({ label, note, children, full }) {
  return /* @__PURE__ */ import_react.default.createElement("label", { className: "field" + (full ? " full" : "") }, /* @__PURE__ */ import_react.default.createElement("span", null, label), children, note && /* @__PURE__ */ import_react.default.createElement("small", null, note));
}
function Toggle({ label, note, value, onChange }) {
  return /* @__PURE__ */ import_react.default.createElement("label", { className: "toggle-field" }, /* @__PURE__ */ import_react.default.createElement("span", null, /* @__PURE__ */ import_react.default.createElement("strong", null, label), note && /* @__PURE__ */ import_react.default.createElement("small", null, note)), /* @__PURE__ */ import_react.default.createElement("input", { type: "checkbox", checked: value, onChange: (e) => onChange(e.target.checked) }));
}
function ModelFields({ catalog, provider, model, set, prefix = "", inherited = false }) {
  const selected = catalog.find((p) => p.id === provider);
  return /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement(Field, { label: prefix + "\u63D0\u4F9B\u65B9" }, /* @__PURE__ */ import_react.default.createElement("select", { value: provider, onChange: (e) => {
    set("provider", e.target.value);
    set("model", "");
  } }, /* @__PURE__ */ import_react.default.createElement("option", { value: "" }, inherited ? "\u6CBF\u7528\u9ED8\u8BA4\u63D0\u4F9B\u65B9" : "\u9009\u62E9 DSH \u63D0\u4F9B\u65B9"), catalog.map((p) => /* @__PURE__ */ import_react.default.createElement("option", { key: p.id, value: p.id }, p.name)))), /* @__PURE__ */ import_react.default.createElement(Field, { label: prefix + "\u6A21\u578B", note: "\u53EF\u4ECE\u76EE\u5F55\u9009\u62E9\uFF0C\u4E5F\u53EF\u76F4\u63A5\u8F93\u5165\u6A21\u578B ID" }, /* @__PURE__ */ import_react.default.createElement("input", { value: model, onChange: (e) => set("model", e.target.value), list: "salon-models-" + prefix + provider, placeholder: inherited ? "\u6CBF\u7528\u9ED8\u8BA4\u6A21\u578B" : "\u9009\u62E9\u6216\u8F93\u5165\u6A21\u578B" }), /* @__PURE__ */ import_react.default.createElement("datalist", { id: "salon-models-" + prefix + provider }, selected?.models.map((m) => /* @__PURE__ */ import_react.default.createElement("option", { key: m.id, value: m.id }, m.name)))));
}
function Settings({ snapshot, catalog, done, error, notify }) {
  const [form, setForm] = (0, import_react.useState)({ ...snapshot.settings });
  const [saving, setSaving] = (0, import_react.useState)(false);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const save = async () => {
    setSaving(true);
    try {
      await act({ action: "settings", patch: form });
      notify("\u6C99\u9F99\u8BBE\u7F6E\u5DF2\u4FDD\u5B58");
      done();
    } catch (e) {
      error(e.message);
    } finally {
      setSaving(false);
    }
  };
  const input = (key, type = "text") => /* @__PURE__ */ import_react.default.createElement("input", { type, value: form[key], onChange: (e) => set(key, type === "number" ? Number(e.target.value) : e.target.value) });
  return /* @__PURE__ */ import_react.default.createElement(Modal, { title: "\u6C99\u9F99\u8BBE\u7F6E", close: done, footer: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("button", { className: "secondary", onClick: done }, "\u53D6\u6D88"), /* @__PURE__ */ import_react.default.createElement("button", { className: "primary", onClick: save, disabled: saving }, "\u4FDD\u5B58\u8BBE\u7F6E")) }, /* @__PURE__ */ import_react.default.createElement("h3", { className: "section-title" }, "\u4F60\u548C\u5979\u4EEC"), /* @__PURE__ */ import_react.default.createElement("div", { className: "form-grid" }, /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u6C99\u9F99\u540D\u79F0" }, input("title")), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u600E\u4E48\u79F0\u547C\u4F60" }, input("userName")), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u4F60\u7684\u8BBE\u5B9A", full: true, note: "\u6027\u522B\u3001\u8EAB\u4EFD\u3001\u4E0E\u4F60\u4EEC\u7684\u5173\u7CFB\u90FD\u7531\u4F60\u51B3\u5B9A\u3002" }, /* @__PURE__ */ import_react.default.createElement("textarea", { value: form.userPersona, onChange: (e) => set("userPersona", e.target.value), placeholder: "\u5728\u8FD9\u91CC\u4ECB\u7ECD\u4F60\u81EA\u5DF1\uFF0C\u4E5F\u53EF\u4EE5\u5148\u7559\u7A7A\u3002" })), /* @__PURE__ */ import_react.default.createElement(ModelFields, { catalog, provider: form.defaultProvider, model: form.defaultModel, set: (k, v) => set(k === "provider" ? "defaultProvider" : "defaultModel", v) })), /* @__PURE__ */ import_react.default.createElement("h3", { className: "section-title" }, "\u4E0A\u4E0B\u6587\u4E0E\u8BB0\u5FC6"), /* @__PURE__ */ import_react.default.createElement("div", { className: "form-grid" }, /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u76EE\u6807\u4E0A\u4E0B\u6587\uFF08tokens\uFF09", note: "\u9ED8\u8BA4 500,000\uFF1B\u6A21\u578B\u5B9E\u9645\u5BB9\u91CF\u66F4\u5C0F\u65F6\u6309\u5B9E\u9645\u5BB9\u91CF\u5904\u7406\uFF0C\u754C\u9762\u6807\u6CE8\u4F30\u7B97\u503C\u3002" }, input("contextTokens", "number")), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u5355\u6B21\u6700\u5927\u8F93\u51FA\uFF08tokens\uFF09" }, input("maxOutputTokens", "number")), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u5F00\u59CB\u6574\u7406\u65E7\u5BF9\u8BDD\u7684\u5360\u7528\u6BD4\u4F8B", note: "0.85 \u8868\u793A\u8FBE\u5230\u53EF\u7528\u9884\u7B97\u7684 85% \u540E\u6574\u7406\uFF0C\u539F\u59CB\u804A\u5929\u6C38\u4E45\u4FDD\u7559\u3002" }, input("compressionTrigger", "number")), /* @__PURE__ */ import_react.default.createElement("p", { className: "field" }, "\u7FA4\u804A\u4F1A\u6301\u7EED\u81EA\u7136\u63A5\u8BDD\uFF0C\u7531\u6210\u5458\u81EA\u5DF1\u5224\u65AD\u4F55\u65F6\u7ED3\u675F\uFF1B\u4F60\u53EF\u4EE5\u968F\u65F6\u63D2\u8BDD\u6216\u505C\u6B62\u3002")), /* @__PURE__ */ import_react.default.createElement("h3", { className: "section-title" }, "\u4E00\u8D77\u770B\u672C\u5730\u89C6\u9891"), /* @__PURE__ */ import_react.default.createElement("div", { className: "form-grid" }, /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u9ED8\u8BA4\u89C6\u9891\u65B9\u5F0F" }, /* @__PURE__ */ import_react.default.createElement("select", { value: form.videoMode, onChange: (e) => set("videoMode", e.target.value) }, modes.map(([v, t]) => /* @__PURE__ */ import_react.default.createElement("option", { key: v, value: v }, t)))), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u62BD\u5E27\u95F4\u9694\uFF08\u79D2\uFF09" }, input("frameInterval", "number")), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u6700\u591A\u753B\u9762\u5E27\u6570" }, input("maxFrames", "number")), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u753B\u9762\u5BBD\u5EA6\uFF08\u50CF\u7D20\uFF09" }, input("frameWidth", "number")), /* @__PURE__ */ import_react.default.createElement(Field, { label: "Gemini \u539F\u751F\u63A5\u53E3\u5730\u5740\uFF08\u53EF\u9009\uFF09", note: "\u9ED8\u8BA4\u4ECE\u89D2\u8272\u7684 DSH \u63D0\u4F9B\u65B9\u8BFB\u53D6\uFF1B\u4E2D\u8F6C\u7AD9\u5FC5\u987B\u652F\u6301\u539F\u751F generateContent\u3002" }, input("nativeBaseURL")), /* @__PURE__ */ import_react.default.createElement(Field, { label: "DSH \u51ED\u636E\u53D8\u91CF\u540D\uFF08\u53EF\u9009\uFF09", note: "\u8FD9\u91CC\u53EA\u586B\u5DF2\u4FDD\u5B58\u7684\u53D8\u91CF\u540D\uFF0C\u4E0D\u80FD\u586B\u5BC6\u94A5\u672C\u8EAB\u3002" }, input("nativeKeyRef")), /* @__PURE__ */ import_react.default.createElement(ModelFields, { catalog, provider: form.videoProvider, model: form.videoModel, prefix: "\u58F0\u97F3\u8F6C\u5199", inherited: true, set: (k, v) => set(k === "provider" ? "videoProvider" : "videoModel", v) })), /* @__PURE__ */ import_react.default.createElement(Toggle, { label: "\u62BD\u5E27\u65F6\u4E5F\u8F6C\u5199\u58F0\u97F3", note: "\u4F7F\u7528\u4E0A\u9762\u9009\u5B9A\u7684 Gemini \u901A\u9053\uFF1B\u6CA1\u6709\u58F0\u97F3\u6750\u6599\u4F1A\u660E\u786E\u6807\u6CE8\uFF0C\u4E5F\u53EF\u4EE5\u7ED9\u89C6\u9891\u624B\u52A8\u8865\u5B57\u5E55\u3002", value: form.transcribeAudio, onChange: (v) => set("transcribeAudio", v) }), /* @__PURE__ */ import_react.default.createElement(Toggle, { label: "\u5141\u8BB8\u89C6\u9891\u76F4\u4F20\u5931\u8D25\u540E\u6539\u7528\u62BD\u5E27", note: "\u9ED8\u8BA4\u5173\u95ED\u3002\u5F00\u542F\u540E\u4ECD\u4F1A\u5728\u6D88\u606F\u4E0B\u65B9\u6807\u6CE8\u56DE\u9000\u539F\u56E0\u3002", value: form.allowVideoFallback, onChange: (v) => set("allowVideoFallback", v) }), /* @__PURE__ */ import_react.default.createElement("h3", { className: "section-title" }, "\u5E73\u65F6\u4E5F\u60F3\u627E\u4F60\u804A\u804A"), /* @__PURE__ */ import_react.default.createElement(Toggle, { label: "\u5141\u8BB8\u4E3B\u52A8\u804A\u5929", note: "\u5979\u4EEC\u53EF\u4EE5\u4E3B\u52A8\u5728\u7FA4\u91CC\u63A5\u8BDD\u6216\u5355\u72EC\u627E\u4F60\uFF0C\u4E0D\u9700\u8981\u6709\u65B0\u89C6\u9891\u3002\u5BBF\u4E3B\u5173\u95ED\u65F6\u4E0D\u4F1A\u8FD0\u884C\u3002", value: form.autoChat, onChange: (v) => set("autoChat", v) }), /* @__PURE__ */ import_react.default.createElement("div", { className: "form-grid" }, /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u6700\u77ED\u95F4\u9694\uFF08\u5206\u949F\uFF09" }, input("autoMinMinutes", "number")), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u6700\u957F\u95F4\u9694\uFF08\u5206\u949F\uFF09" }, input("autoMaxMinutes", "number")), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u4E3B\u52A8\u79C1\u804A\u7684\u6982\u7387\uFF080\u20131\uFF09" }, input("autoPrivateChance", "number")), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u65F6\u533A" }, input("timezone")), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u5B89\u9759\u65F6\u6BB5\u5F00\u59CB\uFF08\u53EF\u7559\u7A7A\uFF09" }, input("quietStart", "time")), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u5B89\u9759\u65F6\u6BB5\u7ED3\u675F\uFF08\u53EF\u7559\u7A7A\uFF09" }, input("quietEnd", "time"))));
}
function CharacterEditor({ character, catalog, done, error, notify }) {
  const [form, setForm] = (0, import_react.useState)({ ...character });
  const [saving, setSaving] = (0, import_react.useState)(false);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const save = async () => {
    setSaving(true);
    try {
      await act({ action: "character", id: character.id, patch: form });
      notify("\u5979\u7684\u8BBE\u5B9A\u5DF2\u4FDD\u5B58\uFF0C\u4E4B\u540E\u7684\u56DE\u590D\u4F1A\u4F7F\u7528\u65B0\u8BBE\u5B9A");
      done();
    } catch (e) {
      error(e.message);
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ import_react.default.createElement(Modal, { title: character.name + " \xB7 \u89D2\u8272\u8BBE\u5B9A", close: done, footer: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("button", { className: "secondary", onClick: done }, "\u53D6\u6D88"), /* @__PURE__ */ import_react.default.createElement("button", { className: "primary", onClick: save, disabled: saving }, "\u4FDD\u5B58\u8BBE\u5B9A")) }, /* @__PURE__ */ import_react.default.createElement("div", { className: "form-grid" }, /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u540D\u5B57" }, /* @__PURE__ */ import_react.default.createElement("input", { value: form.name, onChange: (e) => set("name", e.target.value) })), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u8EAB\u4EFD" }, /* @__PURE__ */ import_react.default.createElement("input", { value: form.subtitle, onChange: (e) => set("subtitle", e.target.value) })), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u5934\u50CF\uFF08\u8868\u60C5\u6216\u56FE\u7247 URL\uFF09" }, /* @__PURE__ */ import_react.default.createElement("input", { value: form.avatar, onChange: (e) => set("avatar", e.target.value) })), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u4EE3\u8868\u8272" }, /* @__PURE__ */ import_react.default.createElement("input", { type: "color", value: form.color, onChange: (e) => set("color", e.target.value) })), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u5B8C\u6574\u4EBA\u8BBE", full: true, note: "\u4EBA\u8BBE\u59CB\u7EC8\u4FDD\u7559\u5728\u4E0A\u4E0B\u6587\u4E2D\uFF1B\u81EA\u52A8\u6574\u7406\u8BB0\u5FC6\u4E0D\u4F1A\u6539\u5199\u8FD9\u91CC\u3002" }, /* @__PURE__ */ import_react.default.createElement("textarea", { style: { minHeight: 230 }, value: form.persona, onChange: (e) => set("persona", e.target.value) })), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u5174\u8DA3", full: true }, /* @__PURE__ */ import_react.default.createElement("input", { value: form.interests, onChange: (e) => set("interests", e.target.value) })), /* @__PURE__ */ import_react.default.createElement(ModelFields, { catalog, provider: form.provider, model: form.model, set, prefix: "\u89D2\u8272", inherited: true }), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u770B\u89C6\u9891\u7684\u65B9\u5F0F" }, /* @__PURE__ */ import_react.default.createElement("select", { value: form.videoMode, onChange: (e) => set("videoMode", e.target.value) }, /* @__PURE__ */ import_react.default.createElement("option", { value: "inherit" }, "\u6CBF\u7528\u6C99\u9F99\u8BBE\u7F6E"), modes.map(([v, t]) => /* @__PURE__ */ import_react.default.createElement("option", { key: v, value: v }, t)))), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u63A8\u7406\u6863\u4F4D\uFF08\u6A21\u578B\u652F\u6301\u7684\u540D\u79F0\uFF0C\u53EF\u7A7A\uFF09" }, /* @__PURE__ */ import_react.default.createElement("input", { value: form.reasoningEffort, onChange: (e) => set("reasoningEffort", e.target.value) })), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u4E3B\u52A8\u7A0B\u5EA6 \xB7 " + form.initiative }, /* @__PURE__ */ import_react.default.createElement("input", { type: "range", min: "0", max: "1", step: "0.05", value: form.initiative, onChange: (e) => set("initiative", Number(e.target.value)) })), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u8868\u8FBE\u6E29\u5EA6\uFF080\u20132\uFF09" }, /* @__PURE__ */ import_react.default.createElement("input", { type: "number", min: "0", max: "2", step: "0.05", value: form.temperature, onChange: (e) => set("temperature", Number(e.target.value)) }))), /* @__PURE__ */ import_react.default.createElement(Toggle, { label: "\u53C2\u4E0E\u6C99\u9F99", note: "\u6682\u505C\u53C2\u4E0E\u4F1A\u4FDD\u7559\u5979\u7684\u8BBE\u5B9A\u3001\u8BB0\u5FC6\u4E0E\u79C1\u804A\u8BB0\u5F55\u3002", value: form.enabled, onChange: (v) => set("enabled", v) }));
}
function MemoryPanel({ snapshot, initialId, roomId, done, refresh, error, notify }) {
  const [id, setId] = (0, import_react.useState)(initialId || snapshot.characters[0].id), [tab, setTab] = (0, import_react.useState)("memory");
  const [draft, setDraft] = (0, import_react.useState)(null), [busy, setBusy] = (0, import_react.useState)(false);
  const character = snapshot.characters.find((c) => c.id === id);
  const room = snapshot.room, summary = room.summaries?.find((s) => s.id === room.summaryId);
  const [summaryDraft, setSummaryDraft] = (0, import_react.useState)(summary?.text || "");
  (0, import_react.useEffect)(() => setSummaryDraft(summary?.text || ""), [summary?.id]);
  async function doAction(body, message) {
    setBusy(true);
    try {
      await act(body);
      await refresh();
      if (message) notify(message);
    } catch (e) {
      error(e.message);
    } finally {
      setBusy(false);
    }
  }
  const fresh = () => setDraft({ text: "", keys: "", scope: roomId === "group" ? "group" : `dm:${id}`, pinned: false });
  return /* @__PURE__ */ import_react.default.createElement(Modal, { title: "\u8BB0\u5FC6\u3001\u65E5\u8BB0\u4E0E\u6545\u4E8B", close: done, footer: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("button", { className: "secondary", disabled: busy, onClick: () => doAction({ action: "compact", roomId }, "\u672C\u4F1A\u8BDD\u7684\u65E7\u5BF9\u8BDD\u5DF2\u6574\u7406\uFF1B\u539F\u6587\u4ECD\u4FDD\u7559") }, "\u6574\u7406\u672C\u4F1A\u8BDD\u6458\u8981"), /* @__PURE__ */ import_react.default.createElement("a", { className: "secondary", href: "/api/salon/export", download: true }, "\u5BFC\u51FA\u5168\u90E8\u8BB0\u5F55")) }, /* @__PURE__ */ import_react.default.createElement("div", { className: "tabs" }, [["memory", "\u5979\u7684\u8BB0\u5FC6"], ["diary", "\u5979\u7684\u65E5\u8BB0"], ["summary", "\u672C\u4F1A\u8BDD\u6458\u8981"]].map(([v, t]) => /* @__PURE__ */ import_react.default.createElement("button", { key: v, className: tab === v ? "active" : "", onClick: () => setTab(v) }, t))), tab !== "summary" && /* @__PURE__ */ import_react.default.createElement("select", { "aria-label": "\u9009\u62E9\u89D2\u8272", value: id, onChange: (e) => {
    setId(e.target.value);
    setDraft(null);
  } }, snapshot.characters.map((c) => /* @__PURE__ */ import_react.default.createElement("option", { key: c.id, value: c.id }, c.name))), tab === "memory" && /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("div", { style: { marginTop: 15 } }, /* @__PURE__ */ import_react.default.createElement("button", { className: "secondary", onClick: fresh }, "\uFF0B \u6DFB\u52A0\u8BB0\u5FC6 / \u4E16\u754C\u8BBE\u5B9A")), draft && /* @__PURE__ */ import_react.default.createElement("div", { className: "form-grid", style: { marginTop: 18 } }, /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u8BB0\u5FC6\u6B63\u6587", full: true }, /* @__PURE__ */ import_react.default.createElement("textarea", { value: draft.text, onChange: (e) => setDraft({ ...draft, text: e.target.value }) })), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u8BB0\u5FC6\u8303\u56F4" }, /* @__PURE__ */ import_react.default.createElement("select", { value: draft.scope, onChange: (e) => setDraft({ ...draft, scope: e.target.value }) }, /* @__PURE__ */ import_react.default.createElement("option", { value: "group" }, "\u516C\u5F00\u7ECF\u5386\uFF0C\u53EF\u5728\u7FA4\u91CC\u63D0\u8D77"), /* @__PURE__ */ import_react.default.createElement("option", { value: `dm:${id}` }, "\u79C1\u5BC6\uFF0C\u53EA\u5728\u4F60\u4EEC\u79C1\u804A\u65F6\u4F7F\u7528"))), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u5524\u8D77\u5173\u952E\u8BCD\uFF08\u9017\u53F7\u5206\u9694\uFF09" }, /* @__PURE__ */ import_react.default.createElement("input", { value: draft.keys, onChange: (e) => setDraft({ ...draft, keys: e.target.value }) })), /* @__PURE__ */ import_react.default.createElement("div", { className: "full" }, /* @__PURE__ */ import_react.default.createElement(Toggle, { label: "\u59CB\u7EC8\u8BB0\u4F4F", value: draft.pinned, onChange: (v) => setDraft({ ...draft, pinned: v }) }), /* @__PURE__ */ import_react.default.createElement("button", { className: "primary", disabled: busy, onClick: async () => {
    await doAction({ action: "memory", characterId: id, ...draft }, "\u8BB0\u5FC6\u5DF2\u4FDD\u5B58");
    setDraft(null);
  } }, "\u4FDD\u5B58\u8FD9\u6761\u8BB0\u5FC6"))), [...character.memories].sort((a, b) => b.at - a.at).map((m) => /* @__PURE__ */ import_react.default.createElement("article", { className: "memory-entry", key: m.id }, /* @__PURE__ */ import_react.default.createElement("div", { className: "memory-tags" }, /* @__PURE__ */ import_react.default.createElement("span", null, m.scope === "group" ? "\u516C\u5F00\u7ECF\u5386" : "\u4EC5\u4F60\u4EEC\u79C1\u804A", m.pinned ? " \xB7 \u5E38\u9A7B" : ""), /* @__PURE__ */ import_react.default.createElement("span", null, clock(m.at))), /* @__PURE__ */ import_react.default.createElement("p", null, m.text), m.keys?.length > 0 && /* @__PURE__ */ import_react.default.createElement("small", null, "\u5173\u952E\u8BCD\uFF1A", m.keys.join("\u3001")), /* @__PURE__ */ import_react.default.createElement("div", { className: "memory-actions" }, /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => setDraft({ ...m, keys: (m.keys || []).join("\uFF0C") }) }, "\u7F16\u8F91"), /* @__PURE__ */ import_react.default.createElement("button", { disabled: busy, onClick: () => {
    if (confirm("\u5220\u9664\u8FD9\u6761\u8BB0\u5FC6\uFF1F\u539F\u804A\u5929\u8BB0\u5F55\u4F1A\u4FDD\u7559\u3002")) doAction({ action: "memory", characterId: id, id: m.id, remove: true });
  } }, "\u5220\u9664")), /* @__PURE__ */ import_react.default.createElement("details", null, /* @__PURE__ */ import_react.default.createElement("summary", null, "\u6765\u6E90\u8BB0\u5F55"), /* @__PURE__ */ import_react.default.createElement("small", null, m.sourceIds?.length ? m.sourceIds.join(" / ") : "\u4F60\u624B\u52A8\u6DFB\u52A0\u7684\u8BBE\u5B9A")))), !character.memories.length && /* @__PURE__ */ import_react.default.createElement("p", { className: "empty-small" }, "\u4E00\u8D77\u804A\u8FC7\u4E4B\u540E\uFF0C\u5979\u4F1A\u6162\u6162\u8BB0\u4F4F\u503C\u5F97\u7559\u4E0B\u7684\u4E8B\u60C5\u3002")), tab === "diary" && /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, [...character.diaries].reverse().map((d) => /* @__PURE__ */ import_react.default.createElement("article", { className: "memory-entry", key: d.id }, /* @__PURE__ */ import_react.default.createElement("div", { className: "memory-tags" }, d.scope === "group" ? "\u7FA4\u804A\u4E4B\u540E" : "\u79C1\u804A\u4E4B\u540E", " \xB7 ", clock(d.at)), /* @__PURE__ */ import_react.default.createElement("p", null, d.text))), !character.diaries.length && /* @__PURE__ */ import_react.default.createElement("p", { className: "empty-small" }, "\u5979\u7684\u7B2C\u4E00\u7BC7\u65E5\u8BB0\u8FD8\u6CA1\u5199\u4E0B\u3002")), tab === "summary" && /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("p", { style: { color: "#9f91aa", fontSize: 12, marginBottom: 15 } }, "\u65E7\u5BF9\u8BDD\u63A5\u8FD1\u4E0A\u4E0B\u6587\u9884\u7B97\u65F6\u624D\u4F1A\u6574\u7406\u3002\u4EBA\u8BBE\u3001\u76F8\u5173\u957F\u671F\u8BB0\u5FC6\u548C\u6700\u8FD1\u539F\u6587\u5206\u522B\u4FDD\u7559\uFF1B\u6458\u8981\u53EF\u4EE5\u7F16\u8F91\u3001\u56DE\u9000\u3002"), summary ? /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("textarea", { "aria-label": "\u5F53\u524D\u6458\u8981", style: { minHeight: 260 }, value: summaryDraft, onChange: (e) => setSummaryDraft(e.target.value) }), /* @__PURE__ */ import_react.default.createElement("div", { className: "card-actions", style: { marginTop: 12 } }, /* @__PURE__ */ import_react.default.createElement("button", { disabled: busy, onClick: () => doAction({ action: "summary", roomId, text: summaryDraft }, "\u6458\u8981\u5DF2\u4FDD\u5B58") }, "\u4FDD\u5B58\u6458\u8981"), /* @__PURE__ */ import_react.default.createElement("button", { disabled: busy, onClick: () => doAction({ action: "summary", roomId, restore: true }, "\u5DF2\u56DE\u9000\u5230\u4E0A\u4E00\u7248\u6458\u8981") }, "\u56DE\u9000\u4E0A\u4E00\u7248")), /* @__PURE__ */ import_react.default.createElement("small", null, room.summaries.length, " \u4E2A\u7248\u672C \xB7 \u5F53\u524D\u6574\u7406\u81F3\u6D88\u606F ", summary.throughId)) : /* @__PURE__ */ import_react.default.createElement("p", { className: "empty-small" }, "\u4E0A\u4E0B\u6587\u8FD8\u5F88\u5145\u8DB3\uFF0C\u76EE\u524D\u4FDD\u7559\u5B8C\u6574\u539F\u6587\u3002"), snapshot.contextMetrics.map((m) => /* @__PURE__ */ import_react.default.createElement("p", { className: "inline-stat", key: m.characterId }, snapshot.characters.find((c) => c.id === m.characterId)?.name, "\uFF1A\u8F93\u5165\u7EA6 ", quantity(m.estimatedInput), " / \u53EF\u7528 ", quantity(m.budget), " tokens\uFF1B\u76EE\u6807 ", quantity(m.target), "\uFF0C\u6A21\u578B\u4E0A\u9650 ", m.modelLimit ? quantity(m.modelLimit) : "\u672A\u62AB\u9732", "\uFF0C\u89C6\u9891\u9884\u7559 ", quantity(m.mediaReserve)))));
}
function SalonApp({ demo = false }) {
  const [snapshot, setSnapshot] = (0, import_react.useState)(null), [catalog, setCatalog] = (0, import_react.useState)([]), [roomId, setRoomId] = (0, import_react.useState)("group");
  const [drafts, setDrafts] = (0, import_react.useState)({}), [attachments, setAttachments] = (0, import_react.useState)({}), [all, setAll] = (0, import_react.useState)(false);
  const [modal, setModal] = (0, import_react.useState)(null), [error, setError] = (0, import_react.useState)(""), [toast, setToast] = (0, import_react.useState)(""), [uploading, setUploading] = (0, import_react.useState)(false), [older, setOlder] = (0, import_react.useState)([]), [sending, setSending] = (0, import_react.useState)(false);
  const [readAt, setReadAt] = (0, import_react.useState)(() => {
    try {
      return JSON.parse(localStorage.getItem("dsh-salon-read-at") || "{}");
    } catch {
      return {};
    }
  });
  const [mention, setMention] = (0, import_react.useState)(null), [mentionIndex, setMentionIndex] = (0, import_react.useState)(0);
  const chatInput = (0, import_react.useRef)();
  const scroll = (0, import_react.useRef)(), fileInput = (0, import_react.useRef)(), roomRef = (0, import_react.useRef)(roomId), sticky = (0, import_react.useRef)(true), toastTimer = (0, import_react.useRef)();
  roomRef.current = roomId;
  const notify = (value) => {
    setToast(value);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4e3);
  };
  const refresh = (0, import_react.useCallback)(async () => {
    const id = roomRef.current;
    const next = await request("state?room=" + encodeURIComponent(id));
    if (id === roomRef.current) setSnapshot(next);
  }, []);
  (0, import_react.useEffect)(() => {
    let mounted = true, timer;
    const poll = async () => {
      try {
        if (mounted) await refresh();
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) timer = setTimeout(poll, 900);
      }
    };
    poll();
    request("catalog").then((v) => {
      if (mounted) setCatalog(v);
    }).catch((e) => {
      if (mounted) setError(e.message);
    });
    return () => {
      mounted = false;
      clearTimeout(timer);
      clearTimeout(toastTimer.current);
    };
  }, []);
  const changeRoom = (id) => {
    setRoomId(id);
    roomRef.current = id;
    setOlder([]);
    setError("");
    setMention(null);
    sticky.current = true;
    refresh().catch((e) => setError(e.message));
  };
  (0, import_react.useEffect)(() => {
    if (sticky.current && scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [snapshot?.revision, roomId, older.length]);
  const setDraft = (value) => setDrafts((d) => ({ ...d, [roomId]: value }));
  const closeModal = () => {
    setModal(null);
    refresh().catch((e) => setError(e.message));
  };
  const selected = attachments[roomId];
  const current = snapshot?.characters.find((c) => `dm:${c.id}` === roomId);
  const job = snapshot?.jobs.find((j) => j.roomId === roomId);
  const configured = snapshot && (snapshot.settings.defaultProvider && snapshot.settings.defaultModel || snapshot.characters.some((c) => c.provider && c.model));
  async function send() {
    if (sending || job && roomId !== "group") return;
    setSending(true);
    setError("");
    const id = roomId, text = drafts[id] || "", video = attachments[id];
    try {
      await act({ action: "send", roomId: id, text, mediaIds: video ? [video.id] : [], all });
      setMention(null);
      setDrafts((d) => ({ ...d, [id]: "" }));
      setAttachments((a) => ({ ...a, [id]: null }));
      sticky.current = true;
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }
  async function upload(file) {
    if (!file) return;
    const targetRoom = roomRef.current;
    setUploading(true);
    setError("");
    try {
      const video = await request("upload?name=" + encodeURIComponent(file.name), { method: "POST", body: file });
      setAttachments((a) => ({ ...a, [targetRoom]: video }));
      await refresh();
      notify("\u89C6\u9891\u5DF2\u52A0\u5165\u8D44\u6599\u5E93\uFF0C\u53D1\u9001\u540E\u5979\u4EEC\u624D\u4F1A\u89C2\u770B");
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }
  async function doAct(body) {
    try {
      await act(body);
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }
  const characters = snapshot?.characters || [];
  const mentionCandidates = !mention || modal ? [] : [
    ...roomId === "group" ? [{ id: "everyone", name: "\u5168\u4F53", subtitle: "\u8BF7\u6240\u6709\u53EF\u7528\u6210\u5458\u5148\u56DE\u5E94", avatar: "\u2726" }] : [],
    ...characters.filter((c) => c.enabled && (roomId === "group" || roomId === `dm:${c.id}`))
  ].filter((c) => (c.name + c.subtitle).toLowerCase().includes(mention.query.toLowerCase()));
  const syncMention = (value, caret) => {
    setMention(mentionQuery(value, caret));
    setMentionIndex(0);
  };
  function insertMention(character) {
    if (!mention) return;
    const value = drafts[roomId] || "";
    const inserted = "@" + character.name + " ";
    setDraft(value.slice(0, mention.start) + inserted + value.slice(mention.end));
    const caret = mention.start + inserted.length;
    setMention(null);
    requestAnimationFrame(() => {
      chatInput.current?.focus();
      chatInput.current?.setSelectionRange(caret, caret);
    });
  }
  function openMentions() {
    const value = drafts[roomId] || "", start = chatInput.current?.selectionStart ?? value.length, end = chatInput.current?.selectionEnd ?? start;
    const prefix = value.slice(0, start), added = prefix && !/[\s，。！？、：:；;]$/.test(prefix) ? " @" : "@";
    const next = prefix + added + value.slice(end), caret = start + added.length;
    setDraft(next);
    setMention({ start: caret - 1, end: caret, query: "" });
    setMentionIndex(0);
    requestAnimationFrame(() => {
      chatInput.current?.focus();
      chatInput.current?.setSelectionRange(caret, caret);
    });
  }
  function chatKeyDown(event) {
    if (event.nativeEvent.isComposing) return;
    if (mention && mentionCandidates.length) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setMentionIndex((i) => (i + (event.key === "ArrowDown" ? 1 : -1) + mentionCandidates.length) % mentionCandidates.length);
        return;
      }
      if (event.key === "Enter" && !event.shiftKey || event.key === "Tab") {
        event.preventDefault();
        insertMention(mentionCandidates[mentionIndex % mentionCandidates.length]);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setMention(null);
        return;
      }
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }
  (0, import_react.useEffect)(() => {
    if (!snapshot || snapshot.room.id !== roomId || document.visibilityState !== "visible") return;
    const at = snapshot.room.messages.at(-1)?.at || 0;
    if (at > (readAt[roomId] || 0)) setReadAt((previous) => {
      const next = { ...previous, [roomId]: at };
      try {
        localStorage.setItem("dsh-salon-read-at", JSON.stringify(next));
      } catch {
      }
      return next;
    });
  }, [snapshot?.room.id, snapshot?.room.messages.at(-1)?.id, roomId]);
  const unread = (id) => (snapshot?.rooms.find((r) => r.id === id)?.lastAt || 0) > (readAt[id] || 0);
  const messages = snapshot ? [...older.filter((m) => !snapshot.room.messages.some((n) => n.id === m.id)), ...snapshot.room.messages] : [];
  const messageView = (m, partial = false) => {
    const c = characters.find((c2) => c2.id === m.speaker), user = m.speaker === "user";
    return /* @__PURE__ */ import_react.default.createElement("article", { key: m.id, className: "message" + (user ? " user" : "") + (m.error ? " error" : "") + (partial ? " typing" : "") + (m.speaker === "system" ? " system" : "") }, /* @__PURE__ */ import_react.default.createElement("button", { className: "icon-button", style: { padding: 0 }, "aria-label": c ? "\u79C1\u804A" + c.name : "\u7528\u6237", onClick: () => {
      if (c) changeRoom("dm:" + c.id);
    } }, /* @__PURE__ */ import_react.default.createElement(Avatar, { character: c || { avatar: user ? "\u4F60" : "!" } })), /* @__PURE__ */ import_react.default.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ import_react.default.createElement("div", { className: "meta" }, /* @__PURE__ */ import_react.default.createElement("span", { style: { color: c?.color } }, user ? snapshot.settings.userName : c?.name || "\u6C99\u9F99\u63D0\u793A"), /* @__PURE__ */ import_react.default.createElement("time", null, partial ? "\u6B63\u5728\u8F93\u5165" : clock(m.at)), m.automatic && /* @__PURE__ */ import_react.default.createElement("span", null, "\u4E3B\u52A8\u627E\u4F60")), /* @__PURE__ */ import_react.default.createElement("div", { className: "bubble" }, m.mediaIds?.map((id) => {
      const v = snapshot.media.find((v2) => v2.id === id);
      return v && /* @__PURE__ */ import_react.default.createElement("button", { key: id, className: "chat-video", onClick: () => setModal({ type: "video", id }) }, /* @__PURE__ */ import_react.default.createElement("img", { src: mediaURL(id), alt: v.name }), /* @__PURE__ */ import_react.default.createElement("span", null, "\u25B7 ", v.name, " \xB7 ", Math.round(v.duration), "s"));
    }), m.text || /* @__PURE__ */ import_react.default.createElement("span", { className: "typing-dots" }, "\xB7\xB7\xB7")), m.transport && /* @__PURE__ */ import_react.default.createElement("div", { className: "transport" }, m.transport.mode === "native" ? "\u25C8 \u539F\u89C6\u9891\u76F4\u4F20 \xB7 " + (m.transport.audio || "\u539F\u89C6\u9891") : `\u25A7 ${m.transport.frames} \u5E27 \xB7 ${m.transport.audio}`, m.transport.fallbackReason && /* @__PURE__ */ import_react.default.createElement("details", null, /* @__PURE__ */ import_react.default.createElement("summary", null, "\u76F4\u4F20\u5931\u8D25\u540E\u5DF2\u56DE\u9000"), m.transport.fallbackReason), m.transport.warning && /* @__PURE__ */ import_react.default.createElement("details", null, /* @__PURE__ */ import_react.default.createElement("summary", null, "\u58F0\u97F3\u6750\u6599\u672A\u5B8C\u6574\u63D0\u4F9B"), m.transport.warning)), m.retry && /* @__PURE__ */ import_react.default.createElement("button", { className: "memory-link", onClick: () => doAct({ action: "send", roomId, text: "\u8BF7\u91CD\u65B0\u56DE\u5E94\u521A\u624D\u7684\u6D88\u606F\u3002", characterId: m.retry.characterId, mediaIds: m.retry.mediaIds }) }, "\u91CD\u8BD5\u8FD9\u4F4D\u89D2\u8272")));
  };
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "salon", onDragOver: (e) => e.preventDefault(), onDrop: (e) => {
    e.preventDefault();
    if (!modal) upload(e.dataTransfer.files[0]);
  } }, /* @__PURE__ */ import_react.default.createElement("style", null, css), !snapshot ? /* @__PURE__ */ import_react.default.createElement("div", { className: "loading" }, error || "\u6B63\u5728\u63A8\u5F00\u6C99\u9F99\u7684\u95E8\u2026") : /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("nav", { className: "rail", "aria-label": "\u6C99\u9F99\u4F1A\u8BDD" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "brand" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "brand-mark" }, "\u2726"), /* @__PURE__ */ import_react.default.createElement("h1", null, snapshot.settings.title), /* @__PURE__ */ import_react.default.createElement("p", null, "THE LITTLE SALON")), /* @__PURE__ */ import_react.default.createElement("div", { className: "nav-label" }, "SHARED MOMENTS"), /* @__PURE__ */ import_react.default.createElement("button", { className: "room-button" + (roomId === "group" ? " active" : ""), onClick: () => changeRoom("group") }, /* @__PURE__ */ import_react.default.createElement(Avatar, { character: { avatar: "\u2726", color: "#d3b3d6" } }), /* @__PURE__ */ import_react.default.createElement("span", { className: "room-text" }, /* @__PURE__ */ import_react.default.createElement("strong", null, "\u6C99\u9F99\u5BA2\u5385"), /* @__PURE__ */ import_react.default.createElement("small", null, "\u5927\u5BB6\u90FD\u5728\u8FD9\u91CC")), unread("group") && /* @__PURE__ */ import_react.default.createElement("span", { className: "room-dot" })), /* @__PURE__ */ import_react.default.createElement("div", { className: "nav-label" }, "JUST BETWEEN US"), characters.map((c) => /* @__PURE__ */ import_react.default.createElement("button", { key: c.id, className: "room-button" + (roomId === "dm:" + c.id ? " active" : ""), onClick: () => changeRoom("dm:" + c.id) }, /* @__PURE__ */ import_react.default.createElement(Avatar, { character: c }), /* @__PURE__ */ import_react.default.createElement("span", { className: "room-text" }, /* @__PURE__ */ import_react.default.createElement("strong", null, c.name), /* @__PURE__ */ import_react.default.createElement("small", null, c.subtitle)), (snapshot.jobs.some((j) => j.roomId === "dm:" + c.id) || unread("dm:" + c.id)) && /* @__PURE__ */ import_react.default.createElement("span", { className: "room-dot" }))), /* @__PURE__ */ import_react.default.createElement("div", { className: "nav-footer" }, /* @__PURE__ */ import_react.default.createElement("button", { className: "subtle", onClick: () => setModal({ type: "library" }) }, "\u25A7 ", /* @__PURE__ */ import_react.default.createElement("span", { className: "nav-text" }, "\u89C6\u9891\u8D44\u6599\u5E93")), /* @__PURE__ */ import_react.default.createElement("button", { className: "subtle", onClick: () => setModal({ type: "memory", id: current?.id }) }, "\u25C7 ", /* @__PURE__ */ import_react.default.createElement("span", { className: "nav-text" }, "\u8BB0\u5FC6\u4E0E\u65E5\u8BB0")), /* @__PURE__ */ import_react.default.createElement("button", { className: "subtle", onClick: () => setModal({ type: "settings" }) }, "\u2699 ", /* @__PURE__ */ import_react.default.createElement("span", { className: "nav-text" }, "\u6C99\u9F99\u8BBE\u7F6E")))), /* @__PURE__ */ import_react.default.createElement("main", { className: "main" }, demo && /* @__PURE__ */ import_react.default.createElement("div", { className: "demo-banner" }, "\u6F14\u793A\u6A21\u5F0F \xB7 \u56DE\u590D\u4E3A\u6D4B\u8BD5\u6837\u4F8B\uFF0C\u4E0D\u8FDE\u63A5\u771F\u5B9E\u6A21\u578B"), /* @__PURE__ */ import_react.default.createElement("header", { className: "topbar" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h2", null, current ? "\u4E0E" + current.name + "\u7684\u79C1\u8BED" : "\u6C99\u9F99\u5BA2\u5385"), /* @__PURE__ */ import_react.default.createElement("p", null, current ? "\u53EA\u6709\u4F60\u548C\u5979\u77E5\u9053\u7684\u90A3\u4E9B\u4E8B\u3002" : `${characters.filter((c) => c.enabled).length} \u4F4D\u6210\u5458 \xB7 \u60F3\u8BF4\u4EC0\u4E48\uFF0C\u5C31\u8BF4\u4EC0\u4E48\u3002`)), /* @__PURE__ */ import_react.default.createElement("div", { className: "top-actions" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "pill" }, quantity(snapshot.settings.contextTokens), " \u4E0A\u4E0B\u6587"), /* @__PURE__ */ import_react.default.createElement("button", { className: "pill" + (snapshot.settings.autoChat ? " on" : ""), onClick: () => doAct({ action: "settings", patch: { autoChat: !snapshot.settings.autoChat } }) }, snapshot.settings.autoChat ? "\u25CF \u81EA\u7531\u804A\u5929\u4E2D" : "\u25CB \u4E3B\u52A8\u804A\u5929\u5DF2\u6682\u505C"), /* @__PURE__ */ import_react.default.createElement("button", { className: "icon-button", "aria-label": current ? "\u7F16\u8F91\u89D2\u8272" : "\u6C99\u9F99\u8BBE\u7F6E", onClick: () => setModal(current ? { type: "character", id: current.id } : { type: "settings" }) }, "\u2699"))), /* @__PURE__ */ import_react.default.createElement("div", { className: "chat-scroll", ref: scroll, onScroll: () => {
    const el = scroll.current;
    sticky.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  } }, !configured && /* @__PURE__ */ import_react.default.createElement("div", { className: "onboarding" }, /* @__PURE__ */ import_react.default.createElement("span", null, "\u5979\u4EEC\u5DF2\u6765\u5230\u6C99\u9F99\u3002\u9009\u597D DSH \u6A21\u578B\uFF0C\u5C31\u53EF\u4EE5\u5F00\u59CB\u8BA4\u8BC6\u5F7C\u6B64\u3002"), /* @__PURE__ */ import_react.default.createElement("button", { className: "primary", onClick: () => setModal({ type: "settings" }) }, "\u9009\u62E9\u6A21\u578B")), snapshot.room.count > messages.length && /* @__PURE__ */ import_react.default.createElement("button", { className: "secondary load-history", onClick: async () => {
    sticky.current = false;
    try {
      const records = await request("history?room=" + encodeURIComponent(roomId) + "&before=" + messages[0].id);
      setOlder((v) => [...records, ...v]);
    } catch (e) {
      setError(e.message);
    }
  } }, "\u7FFB\u770B\u66F4\u65E9\u7684\u804A\u5929"), !messages.length && /* @__PURE__ */ import_react.default.createElement("section", { className: "empty" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "eyebrow" }, "A LITTLE TIME TOGETHER"), /* @__PURE__ */ import_react.default.createElement("h2", null, current ? current.name + "\u6B63\u5728\u7B49\u4F60" : "\u56DB\u4E2A\u4EBA\uFF0C\u4E00\u95F4\u5BA2\u5385\uFF0C\u8FD8\u6709\u4F60\u3002"), /* @__PURE__ */ import_react.default.createElement("p", null, current ? "\u8FD9\u91CC\u7684\u5BF9\u8BDD\u4E0E\u8BB0\u5FC6\uFF0C\u4F1A\u7559\u5728\u4F60\u4EEC\u4E4B\u95F4\u3002" : "\u5206\u4EAB\u4E00\u6BB5\u89C6\u9891\uFF0C\u804A\u4E00\u4EF6\u5C0F\u4E8B\u3002\n\u8BA9\u719F\u6089\u4ECE\u4ECA\u5929\u7684\u4E00\u53E5\u8BDD\u5F00\u59CB\u3002"), /* @__PURE__ */ import_react.default.createElement("div", { className: "portraits" }, (current ? [current] : characters).map((c) => /* @__PURE__ */ import_react.default.createElement("button", { key: c.id, title: "\u4E0E" + c.name + "\u79C1\u804A", onClick: () => changeRoom("dm:" + c.id) }, /* @__PURE__ */ import_react.default.createElement(Avatar, { character: c, large: true })))), /* @__PURE__ */ import_react.default.createElement("div", { className: "prompts" }, ["\u4ECA\u5929\u5927\u5BB6\u90FD\u5728\u505A\u4EC0\u4E48\uFF1F", "\u5148\u6765\u4E92\u76F8\u8BA4\u8BC6\u4E00\u4E0B\u5427", "\u7ED9\u6211\u8BB2\u4E00\u4EF6\u6709\u8DA3\u7684\u5C0F\u4E8B"].map((t) => /* @__PURE__ */ import_react.default.createElement("button", { className: "chip", key: t, onClick: () => setDraft(t) }, t)))), messages.map((m) => messageView(m)), job && Object.entries(job.partials).map(([id, p]) => messageView({ id: "partial-" + id, speaker: id, text: p.text, at: Date.now() }, true)), job?.phase === "\u6574\u7406\u81EA\u5DF1\u7684\u8BB0\u5FC6" && /* @__PURE__ */ import_react.default.createElement("p", { className: "inline-stat" }, "\u5979\u4EEC\u5728\u5199\u4E0B\u521A\u624D\u503C\u5F97\u8BB0\u4F4F\u7684\u4E8B\u60C5\u2026")), error && /* @__PURE__ */ import_react.default.createElement("div", { className: "alert", role: "alert" }, /* @__PURE__ */ import_react.default.createElement("span", { style: { flex: 1 } }, error), /* @__PURE__ */ import_react.default.createElement("button", { className: "icon-button", "aria-label": "\u5173\u95ED\u63D0\u793A", onClick: () => setError("") }, "\xD7")), /* @__PURE__ */ import_react.default.createElement("div", { className: "composer-wrap" }, mentionCandidates.length > 0 && /* @__PURE__ */ import_react.default.createElement("div", { id: "salon-mentions", className: "mention-menu", role: "listbox", "aria-label": "\u70B9\u540D\u6210\u5458" }, mentionCandidates.map((c, i) => /* @__PURE__ */ import_react.default.createElement("button", { key: c.id, type: "button", role: "option", "aria-selected": i === mentionIndex % mentionCandidates.length, className: i === mentionIndex % mentionCandidates.length ? "selected" : "", onMouseDown: (e) => e.preventDefault(), onClick: () => insertMention(c) }, /* @__PURE__ */ import_react.default.createElement(Avatar, { character: c }), /* @__PURE__ */ import_react.default.createElement("span", null, /* @__PURE__ */ import_react.default.createElement("strong", null, "@", c.name), /* @__PURE__ */ import_react.default.createElement("small", null, c.subtitle)))), /* @__PURE__ */ import_react.default.createElement("small", { className: "mention-hint" }, "\u2191\u2193 \u9009\u62E9 \xB7 Enter / Tab \u63D2\u5165 \xB7 Esc \u5173\u95ED")), /* @__PURE__ */ import_react.default.createElement("div", { className: "composer" }, selected && /* @__PURE__ */ import_react.default.createElement("div", { className: "attachment-strip" }, "\u25A7 ", selected.name, /* @__PURE__ */ import_react.default.createElement("button", { className: "icon-button", "aria-label": "\u79FB\u9664\u5F85\u53D1\u89C6\u9891", onClick: () => setAttachments((a) => ({ ...a, [roomId]: null })) }, "\xD7")), /* @__PURE__ */ import_react.default.createElement("textarea", { ref: chatInput, "aria-label": "\u804A\u5929\u6D88\u606F", "aria-autocomplete": "list", "aria-controls": mentionCandidates.length ? "salon-mentions" : void 0, "aria-expanded": Boolean(mentionCandidates.length), placeholder: uploading ? "\u6B63\u5728\u628A\u89C6\u9891\u653E\u8FDB\u6C99\u9F99\u2026" : current ? "\u6084\u6084\u548C" + current.name + "\u8BF4\u70B9\u4EC0\u4E48\u2026" : "\u548C\u5927\u5BB6\u8BF4\u70B9\u4EC0\u4E48\uFF0C\u6216\u62D6\u5165\u4E00\u6BB5\u89C6\u9891\u2026", value: drafts[roomId] || "", onChange: (e) => {
    setDraft(e.target.value);
    syncMention(e.target.value, e.target.selectionStart);
  }, onClick: (e) => syncMention(e.currentTarget.value, e.currentTarget.selectionStart), onKeyDown: chatKeyDown }), /* @__PURE__ */ import_react.default.createElement("div", { className: "composer-tools" }, /* @__PURE__ */ import_react.default.createElement("button", { className: "icon-button", "aria-label": "\u70B9\u540D\u6210\u5458", onClick: openMentions }, "@"), /* @__PURE__ */ import_react.default.createElement("button", { className: "icon-button", "aria-label": "\u6DFB\u52A0\u672C\u5730\u89C6\u9891", disabled: uploading, onClick: () => fileInput.current.click() }, "\uFF0B"), /* @__PURE__ */ import_react.default.createElement("button", { className: "icon-button", "aria-label": "\u5524\u9192\u4E00\u4F4D\u89D2\u8272", disabled: Boolean(job), onClick: () => doAct({ action: "wake", roomId }) }, "\u2726"), roomId === "group" && /* @__PURE__ */ import_react.default.createElement("label", { className: "check-inline" }, /* @__PURE__ */ import_react.default.createElement("input", { type: "checkbox", checked: all, onChange: (e) => setAll(e.target.checked) }), "\u90FD\u8BF4\u4E24\u53E5"), /* @__PURE__ */ import_react.default.createElement("span", { className: "spacer" }), job && /* @__PURE__ */ import_react.default.createElement("button", { className: "danger", onClick: () => doAct({ action: "stop", roomId }) }, "\u505C\u6B62"), /* @__PURE__ */ import_react.default.createElement("button", { className: "primary", disabled: sending || uploading || Boolean(job && roomId !== "group") || !(drafts[roomId] || "").trim() && !selected, onClick: send }, job && roomId === "group" ? "\u63D2\u8BDD \u2197" : "\u53D1\u9001 \u2197"))), /* @__PURE__ */ import_react.default.createElement("div", { className: "composer-note" }, /* @__PURE__ */ import_react.default.createElement("span", null, job ? job.phase : current ? "\u72EC\u7ACB\u79C1\u804A \xB7 \u79C1\u5BC6\u8BB0\u5FC6\u4E0D\u4F1A\u81EA\u52A8\u8FDB\u5165\u7FA4\u804A" : "Enter \u53D1\u9001 \xB7 Shift + Enter \u6362\u884C \xB7 @\u540D\u5B57\u70B9\u540D"), /* @__PURE__ */ import_react.default.createElement("span", null, snapshot.settings.videoMode === "native" ? "\u539F\u89C6\u9891\u76F4\u4F20" : snapshot.settings.videoMode === "frames" ? "\u62BD\u5E27 + \u58F0\u97F3\u8F6C\u5199" : "\u4E24\u79CD\u89C6\u9891\u901A\u9053\u5747\u53EF\u7528"))), /* @__PURE__ */ import_react.default.createElement("input", { ref: fileInput, type: "file", accept: "video/*,.mkv,.m4v", hidden: true, onChange: (e) => {
    upload(e.target.files[0]);
    e.target.value = "";
  } })), /* @__PURE__ */ import_react.default.createElement("aside", { className: "aside" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "aside-label" }, "\u5728\u8FD9\u91CC\u7684\u5979\u4EEC"), characters.map((c) => /* @__PURE__ */ import_react.default.createElement("article", { className: "character-card", key: c.id }, /* @__PURE__ */ import_react.default.createElement("div", { className: "character-row" }, /* @__PURE__ */ import_react.default.createElement(Avatar, { character: c }), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("strong", null, c.name), /* @__PURE__ */ import_react.default.createElement("small", null, c.subtitle))), /* @__PURE__ */ import_react.default.createElement("p", null, c.interests || "\u8FD8\u5728\u7B49\u5F85\u81EA\u5DF1\u7684\u6545\u4E8B\u3002"), /* @__PURE__ */ import_react.default.createElement("div", { className: "card-actions" }, /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => changeRoom("dm:" + c.id) }, "\u79C1\u4E0B\u804A\u804A"), /* @__PURE__ */ import_react.default.createElement("span", { style: { color: "#504458" } }, "\xB7"), /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => setModal({ type: "character", id: c.id }) }, "\u89D2\u8272\u8BBE\u5B9A"), /* @__PURE__ */ import_react.default.createElement("span", { style: { color: "#504458" } }, "\xB7"), /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => setModal({ type: "memory", id: c.id }) }, "\u8BB0\u5FC6")))), /* @__PURE__ */ import_react.default.createElement("button", { className: "memory-link", style: { marginTop: 16 }, onClick: async () => {
    try {
      const v = await act({ action: "add-character" });
      await refresh();
      setModal({ type: "character", id: v.id });
    } catch (e) {
      setError(e.message);
    }
  } }, "\uFF0B \u9080\u8BF7\u65B0\u6210\u5458"), /* @__PURE__ */ import_react.default.createElement("p", { className: "aside-note" }, "\u5979\u4EEC\u8BB0\u5F97\u5171\u540C\u7684\u7ECF\u5386\uFF0C", /* @__PURE__ */ import_react.default.createElement("br", null), "\u4E5F\u5404\u81EA\u73CD\u85CF\u4E0E\u4F60\u7684\u79C1\u8BED\u3002"), /* @__PURE__ */ import_react.default.createElement("div", { className: "status-row" }, "\u4E0B\u4E00\u6B21\u4E3B\u52A8\u804A\u5929", /* @__PURE__ */ import_react.default.createElement("br", null), snapshot.settings.autoChat && configured ? clock(snapshot.nextAutoAt) : "\u7B49\u5F85\u5F00\u542F\u6216\u9009\u62E9\u6A21\u578B"), snapshot.activity.at(-1) && /* @__PURE__ */ import_react.default.createElement("details", { style: { marginTop: 15 } }, /* @__PURE__ */ import_react.default.createElement("summary", { className: "inline-stat" }, "\u6700\u8FD1\u8FD0\u884C\u63D0\u793A"), snapshot.activity.slice(-5).map((a, i) => /* @__PURE__ */ import_react.default.createElement("p", { key: i, className: "inline-stat" }, a.text)))), modal?.type === "settings" && /* @__PURE__ */ import_react.default.createElement(Settings, { snapshot, catalog, done: closeModal, error: setError, notify }), modal?.type === "character" && characters.find((c) => c.id === modal.id) && /* @__PURE__ */ import_react.default.createElement(CharacterEditor, { key: modal.id, character: characters.find((c) => c.id === modal.id), catalog, done: closeModal, error: setError, notify }), modal?.type === "memory" && /* @__PURE__ */ import_react.default.createElement(MemoryPanel, { snapshot, initialId: modal.id, roomId, done: closeModal, refresh, error: setError, notify }), modal?.type === "library" && /* @__PURE__ */ import_react.default.createElement(Modal, { title: "\u89C6\u9891\u8D44\u6599\u5E93", close: closeModal }, /* @__PURE__ */ import_react.default.createElement("p", { style: { color: "#a394ae", fontSize: 12, marginBottom: 18 } }, "\u53EA\u89C2\u770B\u4F60\u653E\u8FDB\u6765\u7684\u672C\u5730\u89C6\u9891\u3002\u9009\u62E9\u540E\uFF0C\u8FD8\u53EF\u4EE5\u52A0\u4E00\u53E5\u60F3\u5BF9\u5979\u4EEC\u8BF4\u7684\u8BDD\u3002"), /* @__PURE__ */ import_react.default.createElement("button", { className: "secondary", disabled: uploading, onClick: () => fileInput.current.click() }, uploading ? "\u6B63\u5728\u5BFC\u5165\u2026" : "\uFF0B \u5BFC\u5165\u672C\u5730\u89C6\u9891"), /* @__PURE__ */ import_react.default.createElement("div", { className: "video-library", style: { marginTop: 18 } }, snapshot.media.map((v) => /* @__PURE__ */ import_react.default.createElement("article", { className: "video-tile", key: v.id }, /* @__PURE__ */ import_react.default.createElement("img", { src: mediaURL(v.id), alt: v.name }), /* @__PURE__ */ import_react.default.createElement("div", { className: "content" }, /* @__PURE__ */ import_react.default.createElement("h3", null, v.name), /* @__PURE__ */ import_react.default.createElement("p", null, Math.round(v.duration), " \u79D2 \xB7 ", v.width, "\xD7", v.height), /* @__PURE__ */ import_react.default.createElement("button", { className: "secondary", onClick: () => setModal({ type: "video", id: v.id }) }, "\u67E5\u770B"), /* @__PURE__ */ import_react.default.createElement("button", { className: "primary", onClick: () => {
    setAttachments((a) => ({ ...a, [roomId]: v }));
    closeModal();
  } }, "\u4E00\u8D77\u770B"))))), !snapshot.media.length && /* @__PURE__ */ import_react.default.createElement("p", { className: "empty-small" }, "\u8FD8\u6CA1\u6709\u89C6\u9891\u3002\u62D6\u8FDB\u6765\u6216\u70B9\u51FB\u4E0A\u65B9\u5BFC\u5165\u3002")), modal?.type === "video" && /* @__PURE__ */ import_react.default.createElement(VideoPanel, { video: snapshot.media.find((v) => v.id === modal.id), done: closeModal, error: setError, notify }), toast && /* @__PURE__ */ import_react.default.createElement("div", { className: "toast", role: "status" }, toast)));
}
function VideoPanel({ video, done, error, notify }) {
  const [notes, setNotes] = (0, import_react.useState)(video?.notes || "");
  return /* @__PURE__ */ import_react.default.createElement(Modal, { title: video?.name || "\u89C6\u9891", close: done, footer: /* @__PURE__ */ import_react.default.createElement("button", { className: "primary", onClick: async () => {
    try {
      await act({ action: "transcript", id: video.id, text: notes });
      notify("\u5B57\u5E55\u4E0E\u5907\u6CE8\u5DF2\u4FDD\u5B58");
      done();
    } catch (e) {
      error(e.message);
    }
  } }, "\u4FDD\u5B58\u5B57\u5E55\u4E0E\u5907\u6CE8") }, /* @__PURE__ */ import_react.default.createElement("video", { controls: true, src: mediaURL(video.id, "original"), poster: mediaURL(video.id) }), /* @__PURE__ */ import_react.default.createElement(Field, { label: "\u5B57\u5E55 / \u58F0\u97F3\u63CF\u8FF0 / \u5907\u6CE8", note: "\u53EF\u76F4\u63A5\u7C98\u8D34 SRT\u3001VTT \u6216\u6587\u5B57\u3002\u62BD\u5E27\u6A21\u5F0F\u4F18\u5148\u4F7F\u7528\u8FD9\u91CC\u7684\u6750\u6599\u3002" }, /* @__PURE__ */ import_react.default.createElement("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "\u53EF\u7559\u7A7A\uFF0C\u62BD\u5E27\u65F6\u5C1D\u8BD5\u4ECE\u97F3\u8F68\u8F6C\u5199\u3002" })));
}

// client/index.jsx
var name = "salon-client";
var inject = ["slots"];
function apply(ctx) {
  ctx.slots.inject("main", () => ctx.slots.register({ name: "main", key: "salon" }, () => import_react2.default.createElement(SalonApp)));
  ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({ name: "sidebar.panellist", id: "salon", order: 55, label: "\u56DB\u5B63\u6C99\u9F99" }, () => import_react2.default.createElement("span", { style: { fontSize: 20, color: "#d9b2d7" } }, "\u2726")));
}
return module.exports;}});
//# sourceMappingURL=client.js.map
