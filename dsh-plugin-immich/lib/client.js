window.__ModuleLoader__.load({id:"dsh-plugin-immich",factory:function(require){var module={exports:{}};var exports=module.exports;
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
var import_react5 = __toESM(require("react"), 1);
var import_client = require("react-dom/client");

// client/styles.js
var injectStyles = () => {
  const tagId = "dsh-plugin-immich-styles";
  if (typeof document === "undefined" || document.getElementById(tagId)) return;
  const style = document.createElement("style");
  style.id = tagId;
  style.textContent = `
    .dsh-immich-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: dsh-immich-fade-in 0.18s ease-out;
    }
    @keyframes dsh-immich-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .dsh-immich-modal-container {
      width: 90vw;
      max-width: 1080px;
      height: 82vh;
      max-height: 820px;
      background: var(--dsw-alias-surface-primary, #1e1e24);
      color: var(--dsw-alias-label-primary, #f0f0f4);
      border-radius: var(--dsw-radius-2xl, 16px);
      border: 1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.1));
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .dsh-immich-header {
      padding: 14px 20px;
      border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.08));
      display: flex;
      align-items: center;
      gap: 16px;
      background: var(--dsw-alias-surface-secondary, rgba(255, 255, 255, 0.02));
    }
    .dsh-immich-title-box {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 16px;
      flex-shrink: 0;
    }
    .dsh-immich-search-bar {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }
    .dsh-immich-search-input {
      width: 100%;
      height: 36px;
      padding: 0 34px 0 36px;
      background: var(--dsw-specific-input-major, rgba(255, 255, 255, 0.06));
      border: 1px solid var(--dsw-alias-border-l2-darkmode-thin, rgba(255, 255, 255, 0.12));
      border-radius: 999px;
      color: inherit;
      font-size: 13px;
      outline: none;
      transition: all 0.2s ease;
    }
    .dsh-immich-search-input:focus {
      border-color: #6366f1;
      background: var(--dsw-alias-surface-primary, #18181b);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
    }
    .dsh-immich-search-icon {
      position: absolute;
      left: 12px;
      pointer-events: none;
      opacity: 0.6;
    }
    .dsh-immich-search-clear {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      opacity: 0.6;
      display: flex;
      padding: 4px;
    }
    .dsh-immich-search-clear:hover { opacity: 1; }
    
    .dsh-immich-video-mode-switch {
      display: flex;
      background: var(--dsw-specific-input-major, rgba(255, 255, 255, 0.06));
      padding: 2px;
      border-radius: 8px;
      border: 1px solid var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.1));
    }
    .dsh-immich-video-mode-btn {
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      border: none;
      background: transparent;
      color: var(--dsw-alias-label-secondary, #a1a1aa);
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .dsh-immich-video-mode-btn.active {
      background: #6366f1;
      color: #fff;
      font-weight: 500;
    }
    
    .dsh-immich-icon-btn {
      background: transparent;
      border: none;
      color: var(--dsw-alias-label-secondary, #a1a1aa);
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .dsh-immich-icon-btn:hover {
      background: var(--dsw-alias-interactive-bg-hover, rgba(255, 255, 255, 0.08));
      color: var(--dsw-alias-label-primary, #fff);
    }

    .dsh-immich-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
      position: relative;
    }
    .dsh-immich-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 12px;
    }
    .dsh-immich-card {
      position: relative;
      aspect-ratio: 1;
      border-radius: var(--dsw-radius-lg, 10px);
      overflow: hidden;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.03);
      border: 2px solid transparent;
      transition: transform 0.12s ease, border-color 0.15s ease;
      user-select: none;
    }
    .dsh-immich-card:hover {
      transform: translateY(-2px);
    }
    .dsh-immich-card.selected {
      border-color: #6366f1;
    }
    .dsh-immich-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .dsh-immich-check {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.45);
      border: 1.5px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.15s, background-color 0.15s;
    }
    .dsh-immich-card:hover .dsh-immich-check,
    .dsh-immich-card.selected .dsh-immich-check {
      opacity: 1;
    }
    .dsh-immich-card.selected .dsh-immich-check {
      background: #6366f1;
      border-color: #6366f1;
    }
    .dsh-immich-badge {
      position: absolute;
      bottom: 6px;
      left: 6px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
      pointer-events: none;
    }
    .dsh-immich-card-zoom {
      position: absolute;
      bottom: 6px;
      right: 6px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 50%;
      padding: 4px;
      opacity: 0;
      color: #fff;
      transition: opacity 0.15s;
      cursor: zoom-in;
    }
    .dsh-immich-card:hover .dsh-immich-card-zoom {
      opacity: 1;
    }

    .dsh-immich-footer {
      padding: 12px 20px;
      border-top: 1px solid var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.08));
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--dsw-alias-surface-secondary, rgba(255, 255, 255, 0.02));
    }
    .dsh-immich-btn-primary {
      background: #6366f1;
      color: #fff;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.15s;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dsh-immich-btn-primary:hover:not(:disabled) {
      background: #4f46e5;
    }
    .dsh-immich-btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .dsh-immich-btn-secondary {
      background: transparent;
      color: var(--dsw-alias-label-secondary, #a1a1aa);
      border: 1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.12));
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .dsh-immich-btn-secondary:hover {
      background: var(--dsw-alias-interactive-bg-hover, rgba(255, 255, 255, 0.08));
      color: var(--dsw-alias-label-primary, #fff);
    }

    /* Lightbox */
    .dsh-immich-lightbox {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.92);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      animation: dsh-immich-fade-in 0.15s ease-out;
    }
    .dsh-immich-lightbox-header {
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #fff;
    }
    .dsh-immich-lightbox-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      overflow: hidden;
    }
    .dsh-immich-lightbox-img {
      max-width: 90vw;
      max-height: 80vh;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
    }
    .dsh-immich-lightbox-video {
      max-width: 90vw;
      max-height: 80vh;
      border-radius: 8px;
      outline: none;
    }
  `;
  document.head.appendChild(style);
};

// client/gallery.jsx
var import_react4 = __toESM(require("react"), 1);

// client/icons.jsx
var import_react = __toESM(require("react"), 1);
function IconImmich({ size = 16, color = "currentColor", className }) {
  return /* @__PURE__ */ import_react.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className }, /* @__PURE__ */ import_react.default.createElement("rect", { x: "3", y: "3", width: "18", height: "18", rx: "3", ry: "3" }), /* @__PURE__ */ import_react.default.createElement("circle", { cx: "8.5", cy: "8.5", r: "1.5", fill: color }), /* @__PURE__ */ import_react.default.createElement("polyline", { points: "21 15 16 10 5 21" }));
}
function IconSearch({ size = 16, color = "currentColor", className }) {
  return /* @__PURE__ */ import_react.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className }, /* @__PURE__ */ import_react.default.createElement("circle", { cx: "11", cy: "11", r: "8" }), /* @__PURE__ */ import_react.default.createElement("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" }));
}
function IconVideo({ size = 16, color = "currentColor", className }) {
  return /* @__PURE__ */ import_react.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className }, /* @__PURE__ */ import_react.default.createElement("polygon", { points: "23 7 16 12 23 17 23 7" }), /* @__PURE__ */ import_react.default.createElement("rect", { x: "1", y: "5", width: "15", height: "14", rx: "2", ry: "2" }));
}
function IconCheck({ size = 14, color = "currentColor", className }) {
  return /* @__PURE__ */ import_react.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className }, /* @__PURE__ */ import_react.default.createElement("polyline", { points: "20 6 9 17 4 12" }));
}
function IconClose({ size = 16, color = "currentColor", className }) {
  return /* @__PURE__ */ import_react.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className }, /* @__PURE__ */ import_react.default.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), /* @__PURE__ */ import_react.default.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" }));
}
function IconSettings({ size = 16, color = "currentColor", className }) {
  return /* @__PURE__ */ import_react.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className }, /* @__PURE__ */ import_react.default.createElement("circle", { cx: "12", cy: "12", r: "3" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" }));
}
function IconSparkles({ size = 16, color = "currentColor", className }) {
  return /* @__PURE__ */ import_react.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className }, /* @__PURE__ */ import_react.default.createElement("path", { d: "m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" }));
}
function IconZoomIn({ size = 16, color = "currentColor", className }) {
  return /* @__PURE__ */ import_react.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className }, /* @__PURE__ */ import_react.default.createElement("circle", { cx: "11", cy: "11", r: "8" }), /* @__PURE__ */ import_react.default.createElement("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" }), /* @__PURE__ */ import_react.default.createElement("line", { x1: "11", y1: "8", x2: "11", y2: "14" }), /* @__PURE__ */ import_react.default.createElement("line", { x1: "8", y1: "11", x2: "14", y2: "11" }));
}

// client/lightbox.jsx
var import_react2 = __toESM(require("react"), 1);
function Lightbox({ asset, onClose }) {
  if (!asset) return null;
  (0, import_react2.useEffect)(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  const isVideo = asset.type === "video";
  const previewUrl = `/api/immich/original?id=${asset.id}`;
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "dsh-immich-lightbox", onClick: onClose }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "dsh-immich-lightbox-header", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ import_react2.default.createElement("div", { style: { display: "flex", flexDirection: "column" } }, /* @__PURE__ */ import_react2.default.createElement("span", { style: { fontWeight: 600, fontSize: 14 } }, asset.originalFileName), /* @__PURE__ */ import_react2.default.createElement("span", { style: { fontSize: 12, opacity: 0.6 } }, new Date(asset.fileCreatedAt).toLocaleString())), /* @__PURE__ */ import_react2.default.createElement("button", { className: "dsh-immich-icon-btn", onClick: onClose, style: { color: "#fff" } }, /* @__PURE__ */ import_react2.default.createElement(IconClose, { size: 20 }))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "dsh-immich-lightbox-content", onClick: onClose }, isVideo ? /* @__PURE__ */ import_react2.default.createElement(
    "video",
    {
      className: "dsh-immich-lightbox-video",
      src: previewUrl,
      controls: true,
      autoPlay: true,
      onClick: (e) => e.stopPropagation()
    }
  ) : /* @__PURE__ */ import_react2.default.createElement(
    "img",
    {
      className: "dsh-immich-lightbox-img",
      src: previewUrl,
      alt: asset.originalFileName,
      onClick: (e) => e.stopPropagation()
    }
  )));
}

// client/settings.jsx
var import_react3 = __toESM(require("react"), 1);
function ImmichSettingsView({ onSaved, standalone = false }) {
  const [config, setConfig] = (0, import_react3.useState)({
    immichUrl: "http://192.168.1.21:2283",
    apiKey: "",
    hasApiKey: false,
    videoMode: "direct",
    maxFrames: 12,
    frameInterval: 2
  });
  const [testing, setTesting] = (0, import_react3.useState)(false);
  const [testResult, setTestResult] = (0, import_react3.useState)(null);
  const [saving, setSaving] = (0, import_react3.useState)(false);
  const [saveNotice, setSaveNotice] = (0, import_react3.useState)(null);
  (0, import_react3.useEffect)(() => {
    fetch("/api/immich/config").then((res) => res.json()).then((data) => {
      if (data && !data.error) setConfig(data);
    }).catch(() => {
    });
  }, []);
  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/immich/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          immichUrl: config.immichUrl,
          apiKey: config.apiKey
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ ok: true, msg: `\u8FDE\u63A5\u6210\u529F\uFF01Immich \u7248\u672C: ${data.version}` });
      } else {
        setTestResult({ ok: false, msg: data.error || "\u8FDE\u63A5\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u5730\u5740\u6216 Key" });
      }
    } catch (e) {
      setTestResult({ ok: false, msg: e.message || "\u7F51\u7EDC\u8BF7\u6C42\u9519\u8BEF" });
    } finally {
      setTesting(false);
    }
  };
  const handleSave = async () => {
    setSaving(true);
    setSaveNotice(null);
    try {
      const res = await fetch("/api/immich/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveNotice({ ok: true, msg: "\u914D\u7F6E\u5DF2\u4FDD\u5B58\u6210\u529F\uFF01" });
        if (onSaved) onSaved(data.config);
      } else {
        setSaveNotice({ ok: false, msg: data.error || "\u4FDD\u5B58\u5931\u8D25" });
      }
    } catch (e) {
      setSaveNotice({ ok: false, msg: e.message });
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ import_react3.default.createElement("div", { style: { padding: standalone ? "20px" : "10px 0", maxWidth: "640px", color: "inherit" } }, /* @__PURE__ */ import_react3.default.createElement("h3", { style: { margin: "0 0 16px", fontSize: "16px", fontWeight: 600 } }, "Immich \u76F8\u518C\u8FDE\u63A5\u4E0E\u8F93\u5165\u8BBE\u7F6E"), /* @__PURE__ */ import_react3.default.createElement("div", { style: { marginBottom: "16px" } }, /* @__PURE__ */ import_react3.default.createElement("label", { style: { display: "block", fontSize: "13px", marginBottom: "6px", opacity: 0.85 } }, "Immich \u670D\u52A1\u5668\u5730\u5740 (URL)"), /* @__PURE__ */ import_react3.default.createElement(
    "input",
    {
      type: "text",
      value: config.immichUrl || "",
      placeholder: "http://192.168.1.21:2283",
      onChange: (e) => setConfig({ ...config, immichUrl: e.target.value }),
      style: {
        width: "100%",
        height: "36px",
        padding: "0 12px",
        background: "var(--dsw-specific-input-major, rgba(255,255,255,0.06))",
        border: "1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.15))",
        borderRadius: "6px",
        color: "inherit",
        fontSize: "13px"
      }
    }
  ), /* @__PURE__ */ import_react3.default.createElement("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" } }, "\u5185\u7F51 Immich \u670D\u52A1\u7684 Web / API \u8BBF\u95EE\u6839\u5730\u5740")), /* @__PURE__ */ import_react3.default.createElement("div", { style: { marginBottom: "16px" } }, /* @__PURE__ */ import_react3.default.createElement("label", { style: { display: "block", fontSize: "13px", marginBottom: "6px", opacity: 0.85 } }, "Immich API Key"), /* @__PURE__ */ import_react3.default.createElement(
    "input",
    {
      type: "password",
      value: config.apiKey || "",
      placeholder: config.hasApiKey ? "\u5DF2\u4FDD\u5B58 Key\uFF08\u91CD\u65B0\u8F93\u5165\u5C06\u8986\u76D6\uFF09" : "\u8BF7\u8F93\u5165 Immich \u751F\u6210\u7684 API Key",
      onChange: (e) => setConfig({ ...config, apiKey: e.target.value }),
      style: {
        width: "100%",
        height: "36px",
        padding: "0 12px",
        background: "var(--dsw-specific-input-major, rgba(255,255,255,0.06))",
        border: "1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.15))",
        borderRadius: "6px",
        color: "inherit",
        fontSize: "13px"
      }
    }
  ), /* @__PURE__ */ import_react3.default.createElement("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" } }, "\u5728 Immich \u7F51\u9875\u7AEF\u53F3\u4E0A\u89D2\u5934\u50CF -> \u8D26\u6237\u8BBE\u7F6E -> API Keys \u4E2D\u751F\u6210")), /* @__PURE__ */ import_react3.default.createElement("div", { style: { marginBottom: "20px" } }, /* @__PURE__ */ import_react3.default.createElement(
    "button",
    {
      type: "button",
      onClick: handleTest,
      disabled: testing,
      className: "dsh-immich-btn-secondary",
      style: { fontSize: "12px", padding: "6px 14px" }
    },
    testing ? "\u6B63\u5728\u6D4B\u8BD5\u8FDE\u63A5..." : "\u26A1 \u6D4B\u8BD5\u8FDE\u901A\u6027"
  ), testResult && /* @__PURE__ */ import_react3.default.createElement("div", { style: {
    marginTop: "8px",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    background: testResult.ok ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
    color: testResult.ok ? "#4ade80" : "#f87171"
  } }, testResult.msg)), /* @__PURE__ */ import_react3.default.createElement("hr", { style: { border: "none", borderTop: "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.1))", margin: "20px 0" } }), /* @__PURE__ */ import_react3.default.createElement("h4", { style: { margin: "0 0 12px", fontSize: "14px", fontWeight: 600 } }, "\u89C6\u9891\u8F93\u5165\u5904\u7406\u7B56\u7565"), /* @__PURE__ */ import_react3.default.createElement("div", { style: { marginBottom: "16px" } }, /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "flex", gap: "16px", marginBottom: "8px" } }, /* @__PURE__ */ import_react3.default.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px" } }, /* @__PURE__ */ import_react3.default.createElement(
    "input",
    {
      type: "radio",
      name: "videoMode",
      value: "direct",
      checked: config.videoMode === "direct",
      onChange: () => setConfig({ ...config, videoMode: "direct" })
    }
  ), "\u{1F680} \u4F18\u5148\u76F4\u63A5\u4F20\u7ED9\u6A21\u578B (Direct Pass-through)"), /* @__PURE__ */ import_react3.default.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px" } }, /* @__PURE__ */ import_react3.default.createElement(
    "input",
    {
      type: "radio",
      name: "videoMode",
      value: "frames",
      checked: config.videoMode === "frames",
      onChange: () => setConfig({ ...config, videoMode: "frames" })
    }
  ), "\u{1F39E}\uFE0F \u4F7F\u7528\u89C6\u9891\u8F6C\u591A\u5E27\u56FE\u7247 (Video-to-Frames)")), /* @__PURE__ */ import_react3.default.createElement("div", { style: { fontSize: "12px", opacity: 0.65, lineHeight: 1.5 } }, config.videoMode === "direct" ? "\u76F4\u4F20\u6A21\u5F0F\uFF1A\u5C06\u539F\u89C6\u9891\u6587\u4EF6\u76F4\u63A5\u9644\u5165\u5BF9\u8BDD\uFF0C\u4EA4\u7ED9\u652F\u6301\u539F\u751F\u89C6\u9891\u7684\u591A\u6A21\u6001\u5927\u6A21\u578B\u5904\u7406\u3002" : "\u5207\u5E27\u6A21\u5F0F\uFF1A\u5C06\u89C6\u9891\u5747\u5300\u62BD\u53D6\u4E3A\u591A\u5F20\u9759\u6001\u5E8F\u5217\u5173\u952E\u5E27\u56FE\u7247\uFF0C\u4F5C\u4E3A\u56FE\u7247\u7EC4\u6DFB\u52A0\u5230\u5BF9\u8BDD\u4E2D\u3002")), config.videoMode === "frames" && /* @__PURE__ */ import_react3.default.createElement("div", { style: {
    padding: "12px",
    background: "var(--dsw-specific-input-major, rgba(255,255,255,0.03))",
    borderRadius: "8px",
    border: "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.08))",
    marginBottom: "16px"
  } }, /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "flex", gap: "20px" } }, /* @__PURE__ */ import_react3.default.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ import_react3.default.createElement("label", { style: { display: "block", fontSize: "12px", marginBottom: "4px", opacity: 0.8 } }, "\u6700\u5927\u62BD\u53D6\u5E27\u6570"), /* @__PURE__ */ import_react3.default.createElement(
    "input",
    {
      type: "number",
      min: "1",
      max: "30",
      value: config.maxFrames || 12,
      onChange: (e) => setConfig({ ...config, maxFrames: parseInt(e.target.value, 10) || 12 }),
      style: {
        width: "100%",
        height: "32px",
        padding: "0 8px",
        background: "inherit",
        border: "1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.15))",
        borderRadius: "4px",
        color: "inherit"
      }
    }
  )), /* @__PURE__ */ import_react3.default.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ import_react3.default.createElement("label", { style: { display: "block", fontSize: "12px", marginBottom: "4px", opacity: 0.8 } }, "\u91C7\u6837\u95F4\u9694 (\u79D2)"), /* @__PURE__ */ import_react3.default.createElement(
    "input",
    {
      type: "number",
      step: "0.5",
      min: "0.5",
      max: "30",
      value: config.frameInterval || 2,
      onChange: (e) => setConfig({ ...config, frameInterval: parseFloat(e.target.value) || 2 }),
      style: {
        width: "100%",
        height: "32px",
        padding: "0 8px",
        background: "inherit",
        border: "1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.15))",
        borderRadius: "4px",
        color: "inherit"
      }
    }
  )))), /* @__PURE__ */ import_react3.default.createElement("div", { style: { marginTop: "24px", display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ import_react3.default.createElement(
    "button",
    {
      type: "button",
      onClick: handleSave,
      disabled: saving,
      className: "dsh-immich-btn-primary"
    },
    saving ? "\u4FDD\u5B58\u4E2D..." : "\u4FDD\u5B58\u8BBE\u7F6E"
  ), saveNotice && /* @__PURE__ */ import_react3.default.createElement("span", { style: { fontSize: "13px", color: saveNotice.ok ? "#4ade80" : "#f87171" } }, saveNotice.msg)));
}

// client/gallery.jsx
function ImmichGalleryModal({ isOpen, onClose }) {
  const [assets, setAssets] = (0, import_react4.useState)([]);
  const [loading, setLoading] = (0, import_react4.useState)(false);
  const [error, setError] = (0, import_react4.useState)(null);
  const [query, setQuery] = (0, import_react4.useState)("");
  const [isSmartSearch, setIsSmartSearch] = (0, import_react4.useState)(false);
  const [selectedIds, setSelectedIds] = (0, import_react4.useState)(/* @__PURE__ */ new Set());
  const [videoMode, setVideoMode] = (0, import_react4.useState)("direct");
  const [page, setPage] = (0, import_react4.useState)(1);
  const [hasMore, setHasMore] = (0, import_react4.useState)(false);
  const [previewAsset, setPreviewAsset] = (0, import_react4.useState)(null);
  const [showSettings, setShowSettings] = (0, import_react4.useState)(false);
  const [submitting, setSubmitting] = (0, import_react4.useState)(false);
  const [submitProgress, setSubmitProgress] = (0, import_react4.useState)("");
  const bodyRef = (0, import_react4.useRef)(null);
  (0, import_react4.useEffect)(() => {
    if (!isOpen) return;
    fetch("/api/immich/config").then((res) => res.json()).then((cfg) => {
      if (cfg.videoMode) setVideoMode(cfg.videoMode);
      if (!cfg.hasApiKey) {
        setShowSettings(true);
      } else {
        loadTimeline(1, true);
      }
    }).catch(() => setShowSettings(true));
  }, [isOpen]);
  const loadTimeline = async (targetPage = 1, reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/immich/timeline?page=${targetPage}&size=50`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "\u83B7\u53D6\u65F6\u95F4\u7EBF\u5931\u8D25");
      setAssets((prev) => reset ? data.items || [] : [...prev, ...data.items || []]);
      setPage(targetPage);
      setHasMore(data.hasMore || false);
      setIsSmartSearch(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const q = query.trim();
    if (!q) {
      loadTimeline(1, true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/immich/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, page: 1, size: 60 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "\u641C\u7D22\u5931\u8D25");
      setAssets(data.items || []);
      setPage(1);
      setHasMore(data.hasMore || false);
      setIsSmartSearch(data.smartSearch || false);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  };
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const formatDuration = (val) => {
    if (val === null || val === void 0 || val === "") return "";
    let totalSeconds = 0;
    if (typeof val === "number") {
      if (Number.isInteger(val) && val > 200) {
        totalSeconds = Math.round(val / 1e3);
      } else {
        totalSeconds = Math.round(val);
      }
    } else if (typeof val === "string") {
      if (val.includes(":")) {
        const parts = val.split(":").map((p) => parseFloat(p) || 0);
        if (parts.length === 3) {
          totalSeconds = Math.round(parts[0] * 3600 + parts[1] * 60 + parts[2]);
        } else if (parts.length === 2) {
          totalSeconds = Math.round(parts[0] * 60 + parts[1]);
        }
      } else {
        const num = parseFloat(val);
        if (!Number.isNaN(num)) {
          totalSeconds = Number.isInteger(num) && num > 200 ? Math.round(num / 1e3) : Math.round(num);
        }
      }
    }
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
    const seconds = Math.floor(totalSeconds % 60);
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };
  const handleAddToConversation = async () => {
    if (selectedIds.size === 0 || submitting) return;
    setSubmitting(true);
    setSubmitProgress("\u6B63\u5728\u51C6\u5907\u7D20\u6750...");
    try {
      const targetAssets = assets.filter((a) => selectedIds.has(a.id));
      const filesToInject = [];
      for (let i = 0; i < targetAssets.length; i++) {
        const item = targetAssets[i];
        setSubmitProgress(`\u6B63\u5728\u83B7\u53D6 (${i + 1}/${targetAssets.length}): ${item.originalFileName}...`);
        if (item.type === "video") {
          if (videoMode === "direct") {
            const res = await fetch(`/api/immich/original?id=${item.id}`);
            if (!res.ok) throw new Error(`\u83B7\u53D6\u89C6\u9891\u5931\u8D25: ${item.originalFileName}`);
            const blob = await res.blob();
            filesToInject.push(new File([blob], item.originalFileName, { type: blob.type || "video/mp4" }));
          } else {
            setSubmitProgress(`\u6B63\u5728\u62BD\u53D6\u89C6\u9891\u5E27: ${item.originalFileName}...`);
            const res = await fetch("/api/immich/convert-frames", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: item.id })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `\u89C6\u9891\u5207\u5E27\u5931\u8D25: ${item.originalFileName}`);
            for (const frame of data.frames || []) {
              const byteCharacters = atob(frame.base64);
              const byteNumbers = new Array(byteCharacters.length);
              for (let j = 0; j < byteCharacters.length; j++) {
                byteNumbers[j] = byteCharacters.charCodeAt(j);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const frameBlob = new Blob([byteArray], { type: "image/jpeg" });
              filesToInject.push(new File([frameBlob], frame.name, { type: "image/jpeg" }));
            }
          }
        } else {
          const res = await fetch(`/api/immich/original?id=${item.id}`);
          if (!res.ok) throw new Error(`\u83B7\u53D6\u56FE\u7247\u5931\u8D25: ${item.originalFileName}`);
          const blob = await res.blob();
          filesToInject.push(new File([blob], item.originalFileName, { type: blob.type || "image/jpeg" }));
        }
      }
      setSubmitProgress("\u6B63\u5728\u8F7D\u5165\u5BF9\u8BDD\u6846\u8F93\u5165\u533A...");
      const fileInput = document.querySelector('input[type="file"][multiple]');
      if (fileInput) {
        const dt = new DataTransfer();
        for (const f of filesToInject) {
          dt.items.add(f);
        }
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        throw new Error("\u672A\u627E\u5230\u5BF9\u8BDD\u6846\u8F93\u5165\u6846\u7684\u6587\u4EF6\u63A5\u6536\u901A\u9053\uFF0C\u8BF7\u786E\u4FDD\u4F4D\u4E8E\u4F1A\u8BDD\u9875\u9762\u3002");
      }
      onClose();
    } catch (err) {
      alert("\u6DFB\u52A0\u5230\u5BF9\u8BDD\u6846\u5931\u8D25\uFF1A" + err.message);
    } finally {
      setSubmitting(false);
      setSubmitProgress("");
    }
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ import_react4.default.createElement("div", { className: "dsh-immich-modal-backdrop", onClick: onClose }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "dsh-immich-modal-container", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "dsh-immich-header" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "dsh-immich-title-box" }, /* @__PURE__ */ import_react4.default.createElement(IconImmich, { size: 22, color: "#6366f1" }), /* @__PURE__ */ import_react4.default.createElement("span", null, "Immich \u76F8\u518C")), !showSettings && /* @__PURE__ */ import_react4.default.createElement("form", { className: "dsh-immich-search-bar", onSubmit: handleSearch }, /* @__PURE__ */ import_react4.default.createElement("span", { className: "dsh-immich-search-icon" }, isSmartSearch ? /* @__PURE__ */ import_react4.default.createElement(IconSparkles, { size: 16, color: "#818cf8" }) : /* @__PURE__ */ import_react4.default.createElement(IconSearch, { size: 16 })), /* @__PURE__ */ import_react4.default.createElement(
    "input",
    {
      type: "text",
      className: "dsh-immich-search-input",
      placeholder: "\u6309\u6587\u4EF6\u540D\u641C\u7D22\u6216\u81EA\u7136\u8BED\u8A00\u641C\u56FE\uFF08CLIP \u667A\u80FD\u641C\u56FE\uFF09...",
      value: query,
      onChange: (e) => setQuery(e.target.value)
    }
  ), query && /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", className: "dsh-immich-search-clear", onClick: () => {
    setQuery("");
    loadTimeline(1, true);
  } }, /* @__PURE__ */ import_react4.default.createElement(IconClose, { size: 14 }))), !showSettings && /* @__PURE__ */ import_react4.default.createElement("div", { className: "dsh-immich-video-mode-switch", title: "\u9009\u62E9\u89C6\u9891\u7D20\u6750\u8F93\u5165\u7B56\u7565" }, /* @__PURE__ */ import_react4.default.createElement(
    "button",
    {
      type: "button",
      className: `dsh-immich-video-mode-btn ${videoMode === "direct" ? "active" : ""}`,
      onClick: () => setVideoMode("direct")
    },
    "\u{1F680} \u76F4\u4F20\u6A21\u578B"
  ), /* @__PURE__ */ import_react4.default.createElement(
    "button",
    {
      type: "button",
      className: `dsh-immich-video-mode-btn ${videoMode === "frames" ? "active" : ""}`,
      onClick: () => setVideoMode("frames")
    },
    "\u{1F39E}\uFE0F \u5207\u5E27\u591A\u56FE"
  )), /* @__PURE__ */ import_react4.default.createElement(
    "button",
    {
      type: "button",
      className: `dsh-immich-icon-btn ${showSettings ? "active" : ""}`,
      title: "Immich \u8BBE\u7F6E",
      onClick: () => setShowSettings(!showSettings)
    },
    /* @__PURE__ */ import_react4.default.createElement(IconSettings, { size: 18 })
  ), /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", className: "dsh-immich-icon-btn", onClick: onClose, title: "\u5173\u95ED" }, /* @__PURE__ */ import_react4.default.createElement(IconClose, { size: 18 }))), /* @__PURE__ */ import_react4.default.createElement("div", { className: "dsh-immich-body", ref: bodyRef }, showSettings ? /* @__PURE__ */ import_react4.default.createElement(
    ImmichSettingsView,
    {
      standalone: false,
      onSaved: () => {
        setShowSettings(false);
        loadTimeline(1, true);
      }
    }
  ) : /* @__PURE__ */ import_react4.default.createElement(import_react4.default.Fragment, null, error && /* @__PURE__ */ import_react4.default.createElement("div", { style: {
    padding: "16px",
    borderRadius: "8px",
    background: "rgba(239, 68, 68, 0.12)",
    color: "#f87171",
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  } }, /* @__PURE__ */ import_react4.default.createElement("span", null, error), /* @__PURE__ */ import_react4.default.createElement("button", { className: "dsh-immich-btn-secondary", onClick: () => setShowSettings(true), style: { padding: "4px 10px" } }, "\u68C0\u67E5\u8BBE\u7F6E")), loading && assets.length === 0 && /* @__PURE__ */ import_react4.default.createElement("div", { style: { padding: "60px 0", textAlign: "center", opacity: 0.6 } }, "\u6B63\u5728\u8FDE\u63A5 Immich \u52A0\u8F7D\u5A92\u4F53\u8D44\u6E90..."), !loading && assets.length === 0 && !error && /* @__PURE__ */ import_react4.default.createElement("div", { style: { padding: "60px 0", textAlign: "center", opacity: 0.6 } }, query ? "\u672A\u627E\u5230\u76F8\u5173\u7167\u7247\u6216\u89C6\u9891" : "\u76F8\u518C\u6682\u65E0\u5A92\u4F53\u5185\u5BB9"), /* @__PURE__ */ import_react4.default.createElement("div", { className: "dsh-immich-grid" }, assets.map((item) => {
    const isSelected = selectedIds.has(item.id);
    const isVideo = item.type === "video";
    return /* @__PURE__ */ import_react4.default.createElement(
      "div",
      {
        key: item.id,
        className: `dsh-immich-card ${isSelected ? "selected" : ""}`,
        onClick: () => toggleSelect(item.id),
        onDoubleClick: () => setPreviewAsset(item),
        title: `${item.originalFileName} (\u53CC\u51FB\u9884\u89C8)`
      },
      /* @__PURE__ */ import_react4.default.createElement(
        "img",
        {
          className: "dsh-immich-thumb",
          src: `/api/immich/thumbnail?id=${item.id}&size=thumbnail`,
          alt: item.originalFileName,
          loading: "lazy"
        }
      ),
      /* @__PURE__ */ import_react4.default.createElement("div", { className: "dsh-immich-check" }, isSelected && /* @__PURE__ */ import_react4.default.createElement(IconCheck, { size: 14, color: "#fff" })),
      isVideo && /* @__PURE__ */ import_react4.default.createElement("div", { className: "dsh-immich-badge" }, /* @__PURE__ */ import_react4.default.createElement(IconVideo, { size: 12, color: "#fff" }), /* @__PURE__ */ import_react4.default.createElement("span", null, formatDuration(item.duration))),
      /* @__PURE__ */ import_react4.default.createElement(
        "div",
        {
          className: "dsh-immich-card-zoom",
          onClick: (e) => {
            e.stopPropagation();
            setPreviewAsset(item);
          },
          title: "\u5927\u56FE\u5168\u5C4F\u9884\u89C8"
        },
        /* @__PURE__ */ import_react4.default.createElement(IconZoomIn, { size: 14 })
      )
    );
  })), hasMore && !loading && /* @__PURE__ */ import_react4.default.createElement("div", { style: { textAlign: "center", padding: "24px 0" } }, /* @__PURE__ */ import_react4.default.createElement(
    "button",
    {
      type: "button",
      className: "dsh-immich-btn-secondary",
      onClick: () => loadTimeline(page + 1)
    },
    "\u52A0\u8F7D\u66F4\u591A\u5A92\u4F53..."
  )), loading && assets.length > 0 && /* @__PURE__ */ import_react4.default.createElement("div", { style: { textAlign: "center", padding: "16px 0", opacity: 0.6 } }, "\u52A0\u8F7D\u4E2D..."))), !showSettings && /* @__PURE__ */ import_react4.default.createElement("div", { className: "dsh-immich-footer" }, /* @__PURE__ */ import_react4.default.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ import_react4.default.createElement("span", { style: { fontSize: "13px" } }, "\u5DF2\u9009 ", /* @__PURE__ */ import_react4.default.createElement("strong", null, selectedIds.size), " \u9879"), selectedIds.size > 0 && /* @__PURE__ */ import_react4.default.createElement(
    "button",
    {
      type: "button",
      style: { background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: "12px" },
      onClick: () => setSelectedIds(/* @__PURE__ */ new Set())
    },
    "\u6E05\u7A7A\u5DF2\u9009"
  )), /* @__PURE__ */ import_react4.default.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, submitting && /* @__PURE__ */ import_react4.default.createElement("span", { style: { fontSize: "12px", opacity: 0.75 } }, submitProgress), /* @__PURE__ */ import_react4.default.createElement(
    "button",
    {
      type: "button",
      className: "dsh-immich-btn-secondary",
      onClick: onClose,
      disabled: submitting
    },
    "\u53D6\u6D88"
  ), /* @__PURE__ */ import_react4.default.createElement(
    "button",
    {
      type: "button",
      className: "dsh-immich-btn-primary",
      disabled: selectedIds.size === 0 || submitting,
      onClick: handleAddToConversation
    },
    submitting ? "\u6DFB\u52A0\u4E2D..." : `\u6DFB\u52A0\u5230\u5BF9\u8BDD (${selectedIds.size})`
  )))), previewAsset && /* @__PURE__ */ import_react4.default.createElement(Lightbox, { asset: previewAsset, onClose: () => setPreviewAsset(null) }));
}

// client/index.jsx
var name = "immich-client";
var inject = ["slots"];
var openGalleryModalHandler = null;
function ImmichQuickButton() {
  return /* @__PURE__ */ import_react5.default.createElement(
    "button",
    {
      type: "button",
      className: "dsh-immich-icon-btn",
      title: "\u6253\u5F00 Immich \u76F8\u518C",
      onClick: () => {
        if (openGalleryModalHandler) openGalleryModalHandler();
      },
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "28px",
        height: "28px",
        padding: 0,
        borderRadius: "6px",
        background: "transparent",
        border: "none",
        color: "var(--dsw-alias-label-secondary, #a1a1aa)",
        cursor: "pointer"
      }
    },
    /* @__PURE__ */ import_react5.default.createElement(IconImmich, { size: 15 })
  );
}
function GlobalModalHost() {
  const [open, setOpen] = (0, import_react5.useState)(false);
  (0, import_react5.useEffect)(() => {
    openGalleryModalHandler = () => setOpen(true);
    return () => {
      openGalleryModalHandler = null;
    };
  }, []);
  return /* @__PURE__ */ import_react5.default.createElement(ImmichGalleryModal, { isOpen: open, onClose: () => setOpen(false) });
}
function apply(ctx) {
  injectStyles();
  if (typeof document !== "undefined") {
    let container = document.getElementById("dsh-plugin-immich-host");
    if (!container) {
      container = document.createElement("div");
      container.id = "dsh-plugin-immich-host";
      document.body.appendChild(container);
      const root = (0, import_client.createRoot)(container);
      root.render(import_react5.default.createElement(GlobalModalHost));
    }
  }
  ctx.inject(["commandUi"], (scope) => {
    const commands = scope.get("commandUi");
    if (commands) {
      scope.effect(() => commands.register({
        name: "immich",
        label: () => "Immich \u76F8\u518C",
        icon: IconImmich,
        available: () => true,
        ui: {
          kind: "action",
          run: () => {
            if (openGalleryModalHandler) openGalleryModalHandler();
          }
        }
      }));
    }
  });
  ctx.slots.inject(
    "conversation.input.left",
    () => ctx.slots.register(
      { name: "conversation.input.left", order: 85 },
      () => import_react5.default.createElement(ImmichQuickButton)
    )
  );
  ctx.slots.inject(
    "settings.section",
    () => ctx.slots.register(
      { name: "settings.section", id: "immich", label: "Immich \u76F8\u518C" },
      () => import_react5.default.createElement(ImmichSettingsView, { standalone: true })
    )
  );
  console.log("[dsh-plugin-immich] \u524D\u7AEF\u6269\u5C55\u5DF2\u6210\u529F\u5B89\u88C5 (\u52A0\u53F7\u547D\u4EE4\u3001\u5FEB\u6377\u6309\u94AE\u3001\u8BBE\u7F6E\u9879)");
}
return module.exports;}});
//# sourceMappingURL=client.js.map
