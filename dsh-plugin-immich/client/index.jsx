import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { injectStyles } from './styles.js';
import { ImmichGalleryModal } from './gallery.jsx';
import { ImmichSettingsView } from './settings.jsx';
import { IconImmich } from './icons.jsx';
import { attachFiles, validateTarget } from './attachments.mjs';

export const name = 'immich-client';
export const inject = ['slots', 'commandUi', 'conversation', 'sessions'];

export function apply(ctx) {
  const openers = new Map();
  let showGallery = null;

  function open(sessionId) {
    const target = { sessionId, binding: ctx.sessions.binding(sessionId) };
    try {
      validateTarget(ctx, target);
      showGallery?.(target);
    } catch (error) {
      if (target.binding) ctx.conversation.input.for(target.binding.ctx).notify('error', error.message);
    }
  }

  function QuickButton({ useSession }) {
    const sessionId = useSession(session => session?.sessionId);
    useEffect(() => {
      if (!sessionId) return;
      const show = () => open(sessionId);
      openers.set(sessionId, show);
      return () => { if (openers.get(sessionId) === show) openers.delete(sessionId); };
    }, [sessionId]);
    return <button type="button" className="dsh-immich-icon-btn" title="打开 Immich 相册" aria-label="打开 Immich 相册"
      onClick={() => openers.get(sessionId)?.()}><IconImmich size={15} /></button>;
  }

  function ModalHost() {
    const [target, setTarget] = useState(null);
    useEffect(() => {
      showGallery = setTarget;
      return () => { showGallery = null; };
    }, []);
    return target && <ImmichGalleryModal key={target.sessionId} isOpen
      onClose={() => setTarget(null)}
      validateTarget={() => validateTarget(ctx, target)}
      onAttach={files => attachFiles(ctx, target, files)} />;
  }

  ctx.effect(() => {
    const disposeStyles = injectStyles();
    const container = document.createElement('div');
    container.id = 'dsh-plugin-immich-host';
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(<ModalHost />);
    return () => {
      showGallery = null;
      openers.clear();
      root.unmount();
      container.remove();
      disposeStyles?.();
    };
  });

  ctx.effect(() => ctx.commandUi.register({
    name: 'immich', label: () => 'Immich 相册', icon: IconImmich,
    available: ({ sessionId }) => {
      if (!openers.has(sessionId)) return false;
      try { validateTarget(ctx, { sessionId, binding: ctx.sessions.binding(sessionId) }); return true; }
      catch { return false; }
    },
    ui: { kind: 'action', run: ({ sessionId }) => openers.get(sessionId)?.() }
  }));

  ctx.slots.inject('conversation.input.left', () => ctx.slots.register(
    { name: 'conversation.input.left', id: 'immich', order: 85 }, QuickButton
  ));
  ctx.slots.inject('settings.section', () => ctx.slots.register(
    { name: 'settings.section', id: 'immich', label: 'Immich 相册' },
    () => <ImmichSettingsView standalone />
  ));
}
