import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { apply } from '../client/index.jsx';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('registers a session-aware command, attaches to the captured binding and disposes its host and styles', async () => {
  vi.stubGlobal('fetch', vi.fn(async url => {
    if (url.endsWith('/config')) return Response.json({ hasApiKey: true, videoMode: 'direct' });
    if (url.includes('/timeline')) return Response.json({ items: [{ id: 'photo', type: 'image', originalFileName: 'photo.jpg' }] });
    return new Response('bytes', { headers: { 'content-type': 'image/jpeg' } });
  }));
  const registrations = [];
  const effects = [];
  const unregister = vi.fn();
  let command;
  const binding = { ctx: {}, session: { getSnapshot: () => ({ subagent: null }) } };
  const addAttachments = vi.fn(() => true);
  const createDrafts = vi.fn(() => [{ id: 'draft-id' }]);
  const ctx = {
    effect: effect => { const dispose = effect(); if (typeof dispose === 'function') effects.push(dispose); },
    slots: { inject: (_name, run) => run(), register: (options, component) => { registrations.push({ options, component }); return () => {}; } },
    commandUi: { register: value => { command = value; return unregister; } },
    sessions: { binding: () => binding },
    conversation: {
      input: { for: () => ({ state: { getSnapshot: () => ({ phase: 'idle' }) }, addAttachments, notify: vi.fn() }) },
      createDrafts, releaseDraftAttachment: vi.fn()
    }
  };
  await act(async () => apply(ctx));
  expect(document.querySelectorAll('#dsh-plugin-immich-host')).toHaveLength(1);
  const Button = registrations.find(item => item.options.name === 'conversation.input.left').component;
  render(<Button useSession={select => select({ sessionId: 'original-session' })} />);
  expect(command.available({ sessionId: 'original-session' })).toBe(true);
  expect(command.available({ sessionId: 'other-session' })).toBe(false);
  act(() => command.ui.run({ sessionId: 'original-session' }));
  fireEvent.click(await screen.findByAltText('photo.jpg'));
  fireEvent.click(screen.getByText('添加到对话 (1)'));
  await waitFor(() => expect(createDrafts).toHaveBeenCalledTimes(1));
  expect(createDrafts.mock.calls[0][0]).toBe('original-session');
  expect(createDrafts.mock.calls[0][2]).toBe(true);
  expect(addAttachments).toHaveBeenCalledWith(['draft-id']);
  await act(async () => { for (const dispose of effects.reverse()) dispose(); });
  expect(unregister).toHaveBeenCalledOnce();
  expect(document.getElementById('dsh-plugin-immich-host')).toBeNull();
  expect(document.getElementById('dsh-plugin-immich-styles')).toBeNull();
});
