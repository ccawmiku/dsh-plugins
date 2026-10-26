export const injectStyles = () => {
  const tagId = 'dsh-plugin-immich-styles';
  if (typeof document === 'undefined' || document.getElementById(tagId)) return;

  const style = document.createElement('style');
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
