import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { injectStyles } from './styles.js';
import { ImmichGalleryModal } from './gallery.jsx';
import { ImmichSettingsView } from './settings.jsx';
import { IconImmich } from './icons.jsx';

export const name = 'immich-client';
export const inject = ['slots'];

// 全局弹窗控制器
let openGalleryModalHandler = null;

function ImmichQuickButton() {
  return (
    <button
      type="button"
      className="dsh-immich-icon-btn"
      title="打开 Immich 相册"
      onClick={() => {
        if (openGalleryModalHandler) openGalleryModalHandler();
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        padding: 0,
        borderRadius: '6px',
        background: 'transparent',
        border: 'none',
        color: 'var(--dsw-alias-label-secondary, #a1a1aa)',
        cursor: 'pointer'
      }}
    >
      <IconImmich size={15} />
    </button>
  );
}

function GlobalModalHost() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    openGalleryModalHandler = () => setOpen(true);
    return () => {
      openGalleryModalHandler = null;
    };
  }, []);

  return <ImmichGalleryModal isOpen={open} onClose={() => setOpen(false)} />;
}

export function apply(ctx) {
  // 注入样式
  injectStyles();

  // 挂载全局模态框宿主到 document.body
  if (typeof document !== 'undefined') {
    let container = document.getElementById('dsh-plugin-immich-host');
    if (!container) {
      container = document.createElement('div');
      container.id = 'dsh-plugin-immich-host';
      document.body.appendChild(container);
      const root = createRoot(container);
      root.render(React.createElement(GlobalModalHost));
    }
  }

  // 1. 注册加号菜单命令（/immich 和 + 菜单）
  ctx.inject(['commandUi'], (scope) => {
    const commands = scope.get('commandUi');
    if (commands) {
      scope.effect(() => commands.register({
        name: 'immich',
        label: () => 'Immich 相册',
        icon: IconImmich,
        available: () => true,
        ui: {
          kind: 'action',
          run: () => {
            if (openGalleryModalHandler) openGalleryModalHandler();
          }
        }
      }));
    }
  });

  // 2. 注册输入框左侧快捷相册按钮
  ctx.slots.inject('conversation.input.left', () =>
    ctx.slots.register(
      { name: 'conversation.input.left', order: 85 },
      () => React.createElement(ImmichQuickButton)
    )
  );

  // 3. 注册设置项（Settings 区域）
  ctx.slots.inject('settings.section', () =>
    ctx.slots.register(
      { name: 'settings.section', id: 'immich', label: 'Immich 相册' },
      () => React.createElement(ImmichSettingsView, { standalone: true })
    )
  );

  console.log('[dsh-plugin-immich] 前端扩展已成功安装 (加号命令、快捷按钮、设置项)');
}
