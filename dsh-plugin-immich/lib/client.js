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
    .dsh-immich-modal-container *, .dsh-immich-settings * { box-sizing: border-box; }
    button.dsh-immich-check, button.dsh-immich-card-zoom { padding: 0; color: inherit; cursor: pointer; font: inherit; }
    button.dsh-immich-card-zoom { border: none; }
    .dsh-immich-icon-btn:focus-visible, .dsh-immich-check:focus-visible, .dsh-immich-card-zoom:focus-visible { outline: 2px solid #818cf8; outline-offset: 2px; }
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
      min-width: 160px;
      position: relative;
      display: flex;
      align-items: center;
      padding-left: 36px;
      background: var(--dsw-specific-input-major, rgba(255, 255, 255, 0.06));
      border: 1px solid var(--dsw-alias-border-l2-darkmode-thin, rgba(255, 255, 255, 0.12));
      border-radius: 999px;
    }
    .dsh-immich-search-bar:focus-within { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.25); }
    .dsh-immich-search-bar select { border: 0; font: inherit; font-size: 12px; margin-right: 8px; }
    .dsh-immich-search-bar option { background: #1e1e24; color: #f0f0f4; }
    .dsh-immich-search-input {
      flex: 1;
      width: 0;
      min-width: 0;
      height: 36px;
      padding: 0 34px 0 0;
      background: var(--dsw-specific-input-major, rgba(255, 255, 255, 0.06));
      border: 1px solid var(--dsw-alias-border-l2-darkmode-thin, rgba(255, 255, 255, 0.12));
      border-radius: 999px;
      color: inherit;
      font-size: 13px;
      outline: none;
      transition: all 0.2s ease;
    }
    .dsh-immich-search-input, .dsh-immich-search-input:focus { border: none; background: transparent; box-shadow: none; }
    @media (max-width: 760px) {
      .dsh-immich-header { flex-wrap: wrap; gap: 10px; padding: 12px; }
      .dsh-immich-title-box { flex: 1; }
      .dsh-immich-search-bar { order: 3; flex-basis: 100%; }
      .dsh-immich-video-mode-switch { order: 4; }
      .dsh-immich-body, .dsh-immich-footer { padding: 12px; }
    }
    .dsh-immich-card:focus-within .dsh-immich-check, .dsh-immich-card:focus-within .dsh-immich-card-zoom { opacity: 1; }
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
  return () => style.remove();
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

// client/dialog.mjs
var focusableSelector = 'button, input, select, textarea, a[href], [tabindex="0"]';
function activateDialog(dialog) {
  if (!dialog) return;
  const previous = document.activeElement;
  const onKeyDown = (event) => {
    if (event.key !== "Tab") return;
    const candidates = [...dialog.querySelectorAll(focusableSelector)].filter((element) => !element.matches(":disabled") && !element.closest("[hidden], [inert]"));
    if (!candidates.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = candidates[0], last = candidates.at(-1);
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !candidates.includes(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !candidates.includes(active))) {
      event.preventDefault();
      first.focus();
    }
  };
  dialog.addEventListener("keydown", onKeyDown);
  dialog.focus();
  return () => {
    dialog.removeEventListener("keydown", onKeyDown);
    if (previous?.isConnected) previous.focus();
  };
}

// src/media.mjs
function durationSeconds(value) {
  if (typeof value === "number" || typeof value === "string" && /^\d+(\.\d+)?$/.test(value)) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number / 1e3 : 0;
  }
  if (typeof value !== "string" || !/^\d+:\d{2}:\d{2}(\.\d+)?$/.test(value)) return 0;
  const seconds = value.split(":").reduce((total, part) => total * 60 + Number(part), 0);
  return Number.isFinite(seconds) ? seconds : 0;
}
function formatDuration(value) {
  if (value === null || value === void 0 || value === "") return "";
  const total = Math.round(durationSeconds(value));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total % 3600 / 60);
  const seconds = total % 60;
  const short = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return hours ? `${hours}:${short}` : short;
}

// client/lightbox.jsx
var import_react2 = __toESM(require("react"), 1);
function Lightbox({ asset, onClose }) {
  const dialogRef = (0, import_react2.useRef)(null);
  (0, import_react2.useEffect)(() => {
    if (asset) return activateDialog(dialogRef.current);
  }, [Boolean(asset)]);
  (0, import_react2.useEffect)(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  if (!asset) return null;
  const isVideo = asset.type === "video";
  const previewUrl = isVideo ? `/api/immich/original?id=${encodeURIComponent(asset.id)}` : `/api/immich/thumbnail?id=${encodeURIComponent(asset.id)}&size=preview`;
  return /* @__PURE__ */ import_react2.default.createElement("div", { ref: dialogRef, tabIndex: -1, role: "dialog", "aria-modal": "true", "aria-label": asset.originalFileName, className: "dsh-immich-lightbox", onClick: onClose }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "dsh-immich-lightbox-header", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ import_react2.default.createElement("div", { style: { display: "flex", flexDirection: "column" } }, /* @__PURE__ */ import_react2.default.createElement("span", { style: { fontWeight: 600, fontSize: 14 } }, asset.originalFileName), /* @__PURE__ */ import_react2.default.createElement("span", { style: { fontSize: 12, opacity: 0.6 } }, asset.fileCreatedAt ? new Date(asset.fileCreatedAt).toLocaleString() : "\u62CD\u6444\u65F6\u95F4\u672A\u77E5")), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", "aria-label": "\u5173\u95ED\u9884\u89C8", className: "dsh-immich-icon-btn", onClick: onClose, style: { color: "#fff" } }, /* @__PURE__ */ import_react2.default.createElement(IconClose, { size: 20 }))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "dsh-immich-lightbox-content", onClick: onClose }, isVideo ? /* @__PURE__ */ import_react2.default.createElement(
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
  const [loading, setLoading] = (0, import_react3.useState)(true);
  const [loadError, setLoadError] = (0, import_react3.useState)(null);
  const [loadAttempt, setLoadAttempt] = (0, import_react3.useState)(0);
  const [clearApiKey, setClearApiKey] = (0, import_react3.useState)(false);
  const [testing, setTesting] = (0, import_react3.useState)(false);
  const [testResult, setTestResult] = (0, import_react3.useState)(null);
  const [saving, setSaving] = (0, import_react3.useState)(false);
  const [saveNotice, setSaveNotice] = (0, import_react3.useState)(null);
  (0, import_react3.useEffect)(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    fetch("/api/immich/config", { signal: controller.signal }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "\u65E0\u6CD5\u8BFB\u53D6\u914D\u7F6E");
      if (!controller.signal.aborted) setConfig({ ...data, apiKey: "", maxFrames: Math.min(data.maxFrames, 30) });
    }).catch((error) => {
      if (!controller.signal.aborted) setLoadError(error.message);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [loadAttempt]);
  const payload = () => {
    const { apiKey, hasApiKey, ...settings } = config;
    if (clearApiKey || apiKey.trim()) settings.apiKey = clearApiKey ? "" : apiKey.trim();
    return settings;
  };
  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/immich/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          immichUrl: config.immichUrl,
          ...clearApiKey || config.apiKey.trim() ? { apiKey: clearApiKey ? "" : config.apiKey.trim() } : {}
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
        body: JSON.stringify(payload())
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig({ ...data.config, apiKey: "" });
        setClearApiKey(false);
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
  if (loading) return /* @__PURE__ */ import_react3.default.createElement("p", { role: "status" }, "\u6B63\u5728\u8BFB\u53D6 Immich \u8BBE\u7F6E...");
  if (loadError) return /* @__PURE__ */ import_react3.default.createElement("div", { role: "alert" }, loadError, " ", /* @__PURE__ */ import_react3.default.createElement("button", { onClick: () => setLoadAttempt((value) => value + 1) }, "\u91CD\u8BD5"));
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "dsh-immich-settings", style: { padding: standalone ? "20px" : "10px 0", maxWidth: "640px", color: "inherit" } }, /* @__PURE__ */ import_react3.default.createElement("fieldset", { disabled: saving || testing, style: { border: 0, padding: 0, margin: 0, minWidth: 0 } }, /* @__PURE__ */ import_react3.default.createElement("h3", { style: { margin: "0 0 16px", fontSize: "16px", fontWeight: 600 } }, "Immich \u76F8\u518C\u8FDE\u63A5\u4E0E\u8F93\u5165\u8BBE\u7F6E"), /* @__PURE__ */ import_react3.default.createElement("div", { style: { marginBottom: "16px" } }, /* @__PURE__ */ import_react3.default.createElement("label", { style: { display: "block", fontSize: "13px", marginBottom: "6px", opacity: 0.85 } }, "Immich \u670D\u52A1\u5668\u5730\u5740 (URL)"), /* @__PURE__ */ import_react3.default.createElement(
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
      placeholder: clearApiKey ? "\u4FDD\u5B58\u540E\u5C06\u6E05\u9664 Key" : config.hasApiKey ? "\u5DF2\u4FDD\u5B58 Key\uFF08\u7559\u7A7A\u4FDD\u7559\uFF0C\u8F93\u5165\u65B0\u503C\u66FF\u6362\uFF09" : "\u8BF7\u8F93\u5165 Immich \u751F\u6210\u7684 API Key",
      onChange: (e) => {
        setClearApiKey(false);
        setConfig({ ...config, apiKey: e.target.value });
      },
      autoComplete: "new-password",
      "aria-label": "Immich API Key",
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
  ), config.hasApiKey && /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "dsh-immich-btn-secondary", onClick: () => {
    setClearApiKey((value) => !value);
    setConfig({ ...config, apiKey: "" });
  } }, clearApiKey ? "\u64A4\u9500\u6E05\u9664 API Key" : "\u6E05\u9664\u5DF2\u4FDD\u5B58 API Key"), /* @__PURE__ */ import_react3.default.createElement("div", { style: { fontSize: "11px", opacity: 0.6, marginTop: "4px" } }, "\u5728 Immich \u7F51\u9875\u7AEF\u53F3\u4E0A\u89D2\u5934\u50CF -> \u8D26\u6237\u8BBE\u7F6E -> API Keys \u4E2D\u751F\u6210")), /* @__PURE__ */ import_react3.default.createElement("div", { style: { marginBottom: "20px" } }, /* @__PURE__ */ import_react3.default.createElement(
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
  } }, testResult.msg)), /* @__PURE__ */ import_react3.default.createElement("hr", { style: { border: "none", borderTop: "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.1))", margin: "20px 0" } }), /* @__PURE__ */ import_react3.default.createElement("h4", { style: { margin: "0 0 12px", fontSize: "14px", fontWeight: 600 } }, "\u89C6\u9891\u8F93\u5165\u5904\u7406\u7B56\u7565"), /* @__PURE__ */ import_react3.default.createElement("div", { style: { marginBottom: "16px" } }, /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "8px" } }, /* @__PURE__ */ import_react3.default.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px" } }, /* @__PURE__ */ import_react3.default.createElement(
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
      max: "60",
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
  ), saveNotice && /* @__PURE__ */ import_react3.default.createElement("span", { style: { fontSize: "13px", color: saveNotice.ok ? "#4ade80" : "#f87171" } }, saveNotice.msg))));
}

// client/gallery.jsx
function ImmichGalleryModal({ isOpen, onClose, onAttach, validateTarget: validateTarget2 }) {
  const [assets, setAssets] = (0, import_react4.useState)([]);
  const [loading, setLoading] = (0, import_react4.useState)(false);
  const [error, setError] = (0, import_react4.useState)(null);
  const [query, setQuery] = (0, import_react4.useState)("");
  const [isSmartSearch, setIsSmartSearch] = (0, import_react4.useState)(false);
  const [selectedAssets, setSelectedAssets] = (0, import_react4.useState)(/* @__PURE__ */ new Map());
  const [searchMode, setSearchMode] = (0, import_react4.useState)("auto");
  const [videoMode, setVideoMode] = (0, import_react4.useState)("direct");
  const [page, setPage] = (0, import_react4.useState)(1);
  const [hasMore, setHasMore] = (0, import_react4.useState)(false);
  const [previewAsset, setPreviewAsset] = (0, import_react4.useState)(null);
  const [showSettings, setShowSettings] = (0, import_react4.useState)(false);
  const [submitting, setSubmitting] = (0, import_react4.useState)(false);
  const [submitProgress, setSubmitProgress] = (0, import_react4.useState)("");
  const bodyRef = (0, import_react4.useRef)(null);
  const dialogRef = (0, import_react4.useRef)(null);
  const requestRef = (0, import_react4.useRef)(null);
  const submitRef = (0, import_react4.useRef)(null);
  const submittingRef = (0, import_react4.useRef)(false);
  const activeSearch = (0, import_react4.useRef)({ query: "", mode: "auto" });
  const loadAssets = async (targetPage = 1, reset = false, search = activeSearch.current) => {
    if (!reset && requestRef.current) return;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    activeSearch.current = search;
    setLoading(true);
    setError(null);
    if (reset) {
      setAssets([]);
      setHasMore(false);
      if (bodyRef.current) bodyRef.current.scrollTop = 0;
    }
    try {
      const params = new URLSearchParams({ page: String(targetPage) });
      let endpoint = "/api/immich/timeline";
      if (search.query) {
        endpoint = "/api/immich/search";
        params.set("q", search.query);
        params.set("mode", search.mode);
      }
      const res = await fetch(`${endpoint}?${params}`, { signal: controller.signal });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "\u83B7\u53D6\u5A92\u4F53\u5931\u8D25");
      if (controller.signal.aborted) return;
      setAssets((previous) => [...new Map((reset ? data.items || [] : [...previous, ...data.items || []]).map((item) => [item.id, item])).values()]);
      setPage(targetPage);
      setHasMore(Boolean(data.hasMore));
      setIsSmartSearch(Boolean(data.smartSearch));
      if (search.query) activeSearch.current = { ...search, mode: data.mode || search.mode };
    } catch (error2) {
      if (!controller.signal.aborted) setError(error2.message);
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  };
  (0, import_react4.useEffect)(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    setQuery("");
    setSelectedAssets(/* @__PURE__ */ new Map());
    setPreviewAsset(null);
    setLoading(true);
    fetch("/api/immich/config", { signal: controller.signal }).then(async (res) => {
      const config = await res.json();
      if (!res.ok) throw new Error(config.error || "\u65E0\u6CD5\u8BFB\u53D6\u914D\u7F6E");
      if (controller.signal.aborted) return;
      setVideoMode(config.videoMode || "direct");
      setShowSettings(!config.hasApiKey);
      if (config.hasApiKey) loadAssets(1, true, { query: "", mode: "auto" });
      else setLoading(false);
    }).catch((error2) => {
      if (!controller.signal.aborted) {
        setError(error2.message);
        setShowSettings(true);
        setLoading(false);
      }
    });
    return () => {
      controller.abort();
      requestRef.current?.abort();
      requestRef.current = null;
      submitRef.current?.abort();
    };
  }, [isOpen]);
  (0, import_react4.useEffect)(() => {
    if (!isOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        if (previewAsset) setPreviewAsset(null);
        else if (!submittingRef.current) onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, previewAsset, onClose]);
  (0, import_react4.useEffect)(() => {
    if (isOpen) return activateDialog(dialogRef.current);
  }, [isOpen]);
  const handleSearch = (event) => {
    event?.preventDefault();
    loadAssets(1, true, { query: query.trim(), mode: searchMode });
  };
  const toggleSelect = (item) => {
    setSelectedAssets((previous) => {
      const next = new Map(previous);
      if (next.has(item.id)) next.delete(item.id);
      else next.set(item.id, item);
      return next;
    });
  };
  const handleAddToConversation = async () => {
    if (selectedAssets.size === 0 || submittingRef.current) return;
    submittingRef.current = true;
    const controller = new AbortController();
    submitRef.current = controller;
    setSubmitting(true);
    setSubmitProgress("\u6B63\u5728\u51C6\u5907\u7D20\u6750...");
    try {
      validateTarget2();
      const targetAssets = [...selectedAssets.values()];
      const filesToInject = [];
      for (let i = 0; i < targetAssets.length; i++) {
        controller.signal.throwIfAborted();
        const item = targetAssets[i];
        setSubmitProgress(`\u6B63\u5728\u83B7\u53D6 (${i + 1}/${targetAssets.length}): ${item.originalFileName}...`);
        if (item.type === "video") {
          if (videoMode === "direct") {
            const res = await fetch(`/api/immich/original?id=${encodeURIComponent(item.id)}`, { signal: controller.signal });
            if (!res.ok) throw new Error(`\u83B7\u53D6\u89C6\u9891\u5931\u8D25: ${item.originalFileName}`);
            const blob = await res.blob();
            filesToInject.push(new File([blob], item.originalFileName, { type: blob.type || "video/mp4" }));
          } else {
            setSubmitProgress(`\u6B63\u5728\u62BD\u53D6\u89C6\u9891\u5E27: ${item.originalFileName}...`);
            const res = await fetch("/api/immich/convert-frames", {
              signal: controller.signal,
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
          const res = await fetch(`/api/immich/original?id=${encodeURIComponent(item.id)}`, { signal: controller.signal });
          if (!res.ok) throw new Error(`\u83B7\u53D6\u56FE\u7247\u5931\u8D25: ${item.originalFileName}`);
          const blob = await res.blob();
          filesToInject.push(new File([blob], item.originalFileName, { type: blob.type || "image/jpeg" }));
        }
      }
      setSubmitProgress("\u6B63\u5728\u8F7D\u5165\u5BF9\u8BDD\u6846\u8F93\u5165\u533A...");
      if (controller.signal.aborted) return;
      onAttach(filesToInject);
      onClose();
    } catch (err) {
      if (!controller.signal.aborted) setError("\u6DFB\u52A0\u5230\u5BF9\u8BDD\u6846\u5931\u8D25\uFF1A" + err.message);
    } finally {
      submittingRef.current = false;
      if (!controller.signal.aborted) {
        setSubmitting(false);
        setSubmitProgress("");
      }
      submitRef.current = null;
    }
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ import_react4.default.createElement("div", { className: "dsh-immich-modal-backdrop", onClick: () => {
    if (!submittingRef.current) onClose();
  } }, /* @__PURE__ */ import_react4.default.createElement("div", { ref: dialogRef, tabIndex: -1, role: "dialog", "aria-modal": "true", "aria-label": "Immich \u76F8\u518C", "aria-busy": submitting, className: "dsh-immich-modal-container", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "dsh-immich-header" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "dsh-immich-title-box" }, /* @__PURE__ */ import_react4.default.createElement(IconImmich, { size: 22, color: "#6366f1" }), /* @__PURE__ */ import_react4.default.createElement("span", null, "Immich \u76F8\u518C")), !showSettings && /* @__PURE__ */ import_react4.default.createElement("form", { inert: submitting ? "" : void 0, className: "dsh-immich-search-bar", onSubmit: handleSearch }, /* @__PURE__ */ import_react4.default.createElement("span", { className: "dsh-immich-search-icon" }, isSmartSearch ? /* @__PURE__ */ import_react4.default.createElement(IconSparkles, { size: 16, color: "#818cf8" }) : /* @__PURE__ */ import_react4.default.createElement(IconSearch, { size: 16 })), /* @__PURE__ */ import_react4.default.createElement("select", { "aria-label": "\u641C\u7D22\u65B9\u5F0F", value: searchMode, onChange: (event) => setSearchMode(event.target.value), style: { background: "transparent", color: "inherit", maxWidth: 90 } }, /* @__PURE__ */ import_react4.default.createElement("option", { value: "auto" }, "\u81EA\u52A8"), /* @__PURE__ */ import_react4.default.createElement("option", { value: "smart" }, "\u667A\u80FD\u641C\u56FE"), /* @__PURE__ */ import_react4.default.createElement("option", { value: "filename" }, "\u6587\u4EF6\u540D")), /* @__PURE__ */ import_react4.default.createElement(
    "input",
    {
      "aria-label": "\u641C\u7D22 Immich \u5A92\u4F53",
      type: "text",
      className: "dsh-immich-search-input",
      placeholder: "\u6309\u6587\u4EF6\u540D\u641C\u7D22\u6216\u81EA\u7136\u8BED\u8A00\u641C\u56FE\uFF08CLIP \u667A\u80FD\u641C\u56FE\uFF09...",
      value: query,
      onChange: (e) => setQuery(e.target.value)
    }
  ), query && /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", className: "dsh-immich-search-clear", onClick: () => {
    setQuery("");
    loadAssets(1, true, { query: "", mode: "auto" });
  } }, /* @__PURE__ */ import_react4.default.createElement(IconClose, { size: 14 }))), !showSettings && /* @__PURE__ */ import_react4.default.createElement("div", { className: "dsh-immich-video-mode-switch", title: "\u9009\u62E9\u89C6\u9891\u7D20\u6750\u8F93\u5165\u7B56\u7565" }, /* @__PURE__ */ import_react4.default.createElement(
    "button",
    {
      type: "button",
      className: `dsh-immich-video-mode-btn ${videoMode === "direct" ? "active" : ""}`,
      disabled: submitting,
      onClick: () => setVideoMode("direct")
    },
    "\u{1F680} \u76F4\u4F20\u6A21\u578B"
  ), /* @__PURE__ */ import_react4.default.createElement(
    "button",
    {
      type: "button",
      className: `dsh-immich-video-mode-btn ${videoMode === "frames" ? "active" : ""}`,
      disabled: submitting,
      onClick: () => setVideoMode("frames")
    },
    "\u{1F39E}\uFE0F \u5207\u5E27\u591A\u56FE"
  )), /* @__PURE__ */ import_react4.default.createElement(
    "button",
    {
      type: "button",
      className: `dsh-immich-icon-btn ${showSettings ? "active" : ""}`,
      title: "Immich \u8BBE\u7F6E",
      disabled: submitting,
      onClick: () => {
        requestRef.current?.abort();
        setShowSettings(!showSettings);
      }
    },
    /* @__PURE__ */ import_react4.default.createElement(IconSettings, { size: 18 })
  ), /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", className: "dsh-immich-icon-btn", disabled: submitting, onClick: onClose, title: "\u5173\u95ED", "aria-label": "\u5173\u95ED\u76F8\u518C" }, /* @__PURE__ */ import_react4.default.createElement(IconClose, { size: 18 }))), /* @__PURE__ */ import_react4.default.createElement("div", { className: "dsh-immich-body", ref: bodyRef }, showSettings ? /* @__PURE__ */ import_react4.default.createElement(
    ImmichSettingsView,
    {
      standalone: false,
      onSaved: (config) => {
        setVideoMode(config.videoMode);
        setSelectedAssets(/* @__PURE__ */ new Map());
        setQuery("");
        setShowSettings(!config.hasApiKey);
        if (config.hasApiKey) loadAssets(1, true, { query: "", mode: "auto" });
      }
    }
  ) : /* @__PURE__ */ import_react4.default.createElement(import_react4.default.Fragment, null, error && /* @__PURE__ */ import_react4.default.createElement("div", { role: "alert", style: {
    padding: "16px",
    borderRadius: "8px",
    background: "rgba(239, 68, 68, 0.12)",
    color: "#f87171",
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  } }, /* @__PURE__ */ import_react4.default.createElement("span", null, error), /* @__PURE__ */ import_react4.default.createElement("button", { className: "dsh-immich-btn-secondary", onClick: () => setShowSettings(true), style: { padding: "4px 10px" } }, "\u68C0\u67E5\u8BBE\u7F6E")), loading && assets.length === 0 && /* @__PURE__ */ import_react4.default.createElement("div", { style: { padding: "60px 0", textAlign: "center", opacity: 0.6 } }, "\u6B63\u5728\u8FDE\u63A5 Immich \u52A0\u8F7D\u5A92\u4F53\u8D44\u6E90..."), !loading && assets.length === 0 && !error && /* @__PURE__ */ import_react4.default.createElement("div", { style: { padding: "60px 0", textAlign: "center", opacity: 0.6 } }, query ? "\u672A\u627E\u5230\u76F8\u5173\u7167\u7247\u6216\u89C6\u9891" : "\u76F8\u518C\u6682\u65E0\u5A92\u4F53\u5185\u5BB9"), /* @__PURE__ */ import_react4.default.createElement("div", { className: "dsh-immich-grid" }, assets.map((item) => {
    const isSelected = selectedAssets.has(item.id);
    const isVideo = item.type === "video";
    return /* @__PURE__ */ import_react4.default.createElement(
      "div",
      {
        key: item.id,
        className: `dsh-immich-card ${isSelected ? "selected" : ""}`,
        onClick: () => {
          if (!submitting) toggleSelect(item);
        },
        onDoubleClick: () => setPreviewAsset(item),
        title: `${item.originalFileName} (\u53CC\u51FB\u9884\u89C8)`
      },
      /* @__PURE__ */ import_react4.default.createElement(
        "img",
        {
          className: "dsh-immich-thumb",
          src: `/api/immich/thumbnail?id=${encodeURIComponent(item.id)}&size=thumbnail`,
          alt: item.originalFileName,
          loading: "lazy"
        }
      ),
      /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", className: "dsh-immich-check", disabled: submitting, "aria-label": `\u9009\u62E9 ${item.originalFileName}`, "aria-pressed": isSelected, onClick: (event) => {
        event.stopPropagation();
        toggleSelect(item);
      } }, isSelected && /* @__PURE__ */ import_react4.default.createElement(IconCheck, { size: 14, color: "#fff" })),
      isVideo && /* @__PURE__ */ import_react4.default.createElement("div", { className: "dsh-immich-badge" }, /* @__PURE__ */ import_react4.default.createElement(IconVideo, { size: 12, color: "#fff" }), /* @__PURE__ */ import_react4.default.createElement("span", null, formatDuration(item.duration))),
      /* @__PURE__ */ import_react4.default.createElement(
        "button",
        {
          type: "button",
          "aria-label": `\u9884\u89C8 ${item.originalFileName}`,
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
      disabled: submitting,
      onClick: () => loadAssets(page + 1)
    },
    "\u52A0\u8F7D\u66F4\u591A\u5A92\u4F53..."
  )), loading && assets.length > 0 && /* @__PURE__ */ import_react4.default.createElement("div", { style: { textAlign: "center", padding: "16px 0", opacity: 0.6 } }, "\u52A0\u8F7D\u4E2D..."))), !showSettings && /* @__PURE__ */ import_react4.default.createElement("div", { className: "dsh-immich-footer" }, /* @__PURE__ */ import_react4.default.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ import_react4.default.createElement("span", { style: { fontSize: "13px" } }, "\u5DF2\u9009 ", /* @__PURE__ */ import_react4.default.createElement("strong", null, selectedAssets.size), " \u9879"), selectedAssets.size > 0 && /* @__PURE__ */ import_react4.default.createElement(
    "button",
    {
      type: "button",
      style: { background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: "12px" },
      disabled: submitting,
      onClick: () => setSelectedAssets(/* @__PURE__ */ new Map())
    },
    "\u6E05\u7A7A\u5DF2\u9009"
  )), /* @__PURE__ */ import_react4.default.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, submitting && /* @__PURE__ */ import_react4.default.createElement("span", { style: { fontSize: "12px", opacity: 0.75 } }, submitProgress), /* @__PURE__ */ import_react4.default.createElement(
    "button",
    {
      type: "button",
      className: "dsh-immich-btn-secondary",
      onClick: () => {
        submitRef.current?.abort();
        onClose();
      }
    },
    submitting ? "\u53D6\u6D88\u6DFB\u52A0" : "\u53D6\u6D88"
  ), /* @__PURE__ */ import_react4.default.createElement(
    "button",
    {
      type: "button",
      className: "dsh-immich-btn-primary",
      disabled: selectedAssets.size === 0 || submitting,
      onClick: handleAddToConversation
    },
    submitting ? "\u6DFB\u52A0\u4E2D..." : `\u6DFB\u52A0\u5230\u5BF9\u8BDD (${selectedAssets.size})`
  )))), previewAsset && /* @__PURE__ */ import_react4.default.createElement(Lightbox, { asset: previewAsset, onClose: () => setPreviewAsset(null) }));
}

// client/attachments.mjs
function validateTarget(ctx, target) {
  const binding = ctx.sessions.binding(target.sessionId);
  if (!binding || binding !== target.binding || binding.session.getSnapshot().subagent !== null) {
    throw new Error("\u539F\u4F1A\u8BDD\u5DF2\u5173\u95ED\u6216\u5F53\u524D\u4F1A\u8BDD\u4E0D\u652F\u6301\u6DFB\u52A0\u9644\u4EF6\uFF0C\u8BF7\u91CD\u65B0\u6253\u5F00\u76F8\u518C");
  }
  const input = ctx.conversation.input.for(binding.ctx);
  if (["adjudicating", "submitting"].includes(input.state.getSnapshot().phase)) {
    throw new Error("\u539F\u4F1A\u8BDD\u6B63\u5728\u53D1\u9001\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");
  }
  return input;
}
function attachFiles(ctx, target, files) {
  if (!files.length) throw new Error("\u6CA1\u6709\u53EF\u6DFB\u52A0\u7684\u5A92\u4F53\u6587\u4EF6");
  const input = validateTarget(ctx, target);
  let drafts = [];
  try {
    drafts = ctx.conversation.createDrafts(target.sessionId, files, true);
    if (!input.addAttachments(drafts.map((draft) => draft.id))) throw new Error("\u4F1A\u8BDD\u6682\u65F6\u65E0\u6CD5\u63A5\u6536\u9644\u4EF6\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");
  } catch (error) {
    for (const draft of drafts) ctx.conversation.releaseDraftAttachment(draft.id);
    throw error;
  }
}

// client/index.jsx
var name = "immich-client";
var inject = ["slots", "commandUi", "conversation", "sessions"];
function apply(ctx) {
  const openers = /* @__PURE__ */ new Map();
  let showGallery = null;
  function open(sessionId) {
    const target = { sessionId, binding: ctx.sessions.binding(sessionId) };
    try {
      validateTarget(ctx, target);
      showGallery?.(target);
    } catch (error) {
      if (target.binding) ctx.conversation.input.for(target.binding.ctx).notify("error", error.message);
    }
  }
  function QuickButton({ useSession }) {
    const sessionId = useSession((session) => session?.sessionId);
    (0, import_react5.useEffect)(() => {
      if (!sessionId) return;
      const show = () => open(sessionId);
      openers.set(sessionId, show);
      return () => {
        if (openers.get(sessionId) === show) openers.delete(sessionId);
      };
    }, [sessionId]);
    return /* @__PURE__ */ import_react5.default.createElement(
      "button",
      {
        type: "button",
        className: "dsh-immich-icon-btn",
        title: "\u6253\u5F00 Immich \u76F8\u518C",
        "aria-label": "\u6253\u5F00 Immich \u76F8\u518C",
        onClick: () => openers.get(sessionId)?.()
      },
      /* @__PURE__ */ import_react5.default.createElement(IconImmich, { size: 15 })
    );
  }
  function ModalHost() {
    const [target, setTarget] = (0, import_react5.useState)(null);
    (0, import_react5.useEffect)(() => {
      showGallery = setTarget;
      return () => {
        showGallery = null;
      };
    }, []);
    return target && /* @__PURE__ */ import_react5.default.createElement(
      ImmichGalleryModal,
      {
        key: target.sessionId,
        isOpen: true,
        onClose: () => setTarget(null),
        validateTarget: () => validateTarget(ctx, target),
        onAttach: (files) => attachFiles(ctx, target, files)
      }
    );
  }
  ctx.effect(() => {
    const disposeStyles = injectStyles();
    const container = document.createElement("div");
    container.id = "dsh-plugin-immich-host";
    document.body.appendChild(container);
    const root = (0, import_client.createRoot)(container);
    root.render(/* @__PURE__ */ import_react5.default.createElement(ModalHost, null));
    return () => {
      showGallery = null;
      openers.clear();
      root.unmount();
      container.remove();
      disposeStyles?.();
    };
  });
  ctx.effect(() => ctx.commandUi.register({
    name: "immich",
    label: () => "Immich \u76F8\u518C",
    icon: IconImmich,
    available: ({ sessionId }) => {
      if (!openers.has(sessionId)) return false;
      try {
        validateTarget(ctx, { sessionId, binding: ctx.sessions.binding(sessionId) });
        return true;
      } catch {
        return false;
      }
    },
    ui: { kind: "action", run: ({ sessionId }) => openers.get(sessionId)?.() }
  }));
  ctx.slots.inject("conversation.input.left", () => ctx.slots.register(
    { name: "conversation.input.left", id: "immich", order: 85 },
    QuickButton
  ));
  ctx.slots.inject("settings.section", () => ctx.slots.register(
    { name: "settings.section", id: "immich", label: "Immich \u76F8\u518C" },
    () => /* @__PURE__ */ import_react5.default.createElement(ImmichSettingsView, { standalone: true })
  ));
}
return module.exports;}});
//# sourceMappingURL=client.js.map
