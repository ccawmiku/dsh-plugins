import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ImmichSettingsView } from '../client/settings.jsx';
import { ImmichGalleryModal } from '../client/gallery.jsx';
import { Lightbox } from '../client/lightbox.jsx';

const config = { hasApiKey: true, apiKey: '••••••••', immichUrl: 'http://server:2283', videoMode: 'direct', maxFrames: 12, frameInterval: 2 };
const asset = id => ({ id, type: 'image', originalFileName: id + '.jpg', fileCreatedAt: '2026-01-01' });
const page = (items, extra = {}) => Response.json({ items, hasMore: false, ...extra });
const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
};
let fetchMock;
beforeEach(() => { fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('settings credential lifecycle', () => {
  it('keeps the saved key on test and repeated saves, then allows replacement and explicit clearing', async () => {
    const bodies = [];
    fetchMock.mockImplementation(async (url, options) => {
      if (!options?.method) return Response.json(config);
      const body = JSON.parse(options.body);
      bodies.push([url, body]);
      if (url.endsWith('/test')) return Response.json({ success: true, version: '2.0.0' });
      return Response.json({ success: true, config: { ...config, hasApiKey: body.apiKey !== '', apiKey: '••••••••' } });
    });
    render(<ImmichSettingsView />);
    const input = await screen.findByLabelText('Immich API Key');
    expect(input.value).toBe('');
    fireEvent.click(screen.getByText('⚡ 测试连通性'));
    await screen.findByText(/连接成功/);
    expect(bodies[0][1]).not.toHaveProperty('apiKey');
    fireEvent.click(screen.getByText('保存设置'));
    await screen.findByText('配置已保存成功！');
    expect(bodies[1][1]).not.toHaveProperty('apiKey');
    fireEvent.change(input, { target: { value: 'replacement' } });
    fireEvent.click(screen.getByText('保存设置'));
    await waitFor(() => expect(input.value).toBe(''));
    expect(bodies[2][1].apiKey).toBe('replacement');
    fireEvent.click(screen.getByText('保存设置'));
    await screen.findByText('配置已保存成功！');
    expect(bodies[3][1]).not.toHaveProperty('apiKey');
    fireEvent.click(screen.getByText('清除已保存 API Key'));
    fireEvent.click(screen.getByText('保存设置'));
    await waitFor(() => expect(bodies.at(-1)[1].apiKey).toBe(''));
  });

  it('does not allow saving fallback defaults when configuration loading failed', async () => {
    fetchMock.mockResolvedValue(Response.json({ error: 'configuration unavailable' }, { status: 500 }));
    render(<ImmichSettingsView />);
    await screen.findByRole('alert');
    expect(screen.queryByText('保存设置')).toBeNull();
  });
});

describe('gallery', () => {
  it('loads subsequent search pages with the submitted query and pinned search mode', async () => {
    const searches = [];
    fetchMock.mockImplementation(async url => {
      if (url.endsWith('/config')) return Response.json(config);
      if (url.includes('/timeline')) return page([asset('timeline')]);
      const params = new URL(url, 'http://localhost').searchParams;
      searches.push(Object.fromEntries(params));
      return page([asset('search-' + params.get('page'))], { hasMore: params.get('page') === '1', mode: 'filename' });
    });
    render(<ImmichGalleryModal isOpen onClose={vi.fn()} onAttach={vi.fn()} validateTarget={vi.fn()} />);
    await screen.findByAltText('timeline.jpg');
    const search = screen.getByLabelText('搜索 Immich 媒体');
    fireEvent.change(search, { target: { value: 'IMG' } });
    fireEvent.submit(search.closest('form'));
    await screen.findByAltText('search-1.jpg');
    fireEvent.change(search, { target: { value: 'unsubmitted' } });
    fireEvent.click(screen.getByText('加载更多媒体...'));
    await screen.findByAltText('search-2.jpg');
    expect(searches.map(item => [item.q, item.mode, item.page])).toEqual([['IMG', 'auto', '1'], ['IMG', 'filename', '2']]);
    expect(screen.queryByAltText('timeline.jpg')).toBeNull();
  });

  it('adds selections across searches in selection order through the attachment callback', async () => {
    const onAttach = vi.fn();
    fetchMock.mockImplementation(async url => {
      if (url.endsWith('/config')) return Response.json(config);
      if (url.includes('/timeline')) return page([asset('first')]);
      if (url.includes('/search')) return page([asset('second')], { mode: 'filename' });
      return new Response('image-bytes', { headers: { 'content-type': 'image/jpeg' } });
    });
    const onClose = vi.fn();
    render(<ImmichGalleryModal isOpen onClose={onClose} onAttach={onAttach} validateTarget={vi.fn()} />);
    fireEvent.click(await screen.findByAltText('first.jpg'));
    const search = screen.getByLabelText('搜索 Immich 媒体');
    fireEvent.change(search, { target: { value: 'second' } });
    fireEvent.submit(search.closest('form'));
    fireEvent.click(await screen.findByAltText('second.jpg'));
    fireEvent.click(screen.getByText('添加到对话 (2)'));
    await waitFor(() => expect(onAttach).toHaveBeenCalledTimes(1));
    expect(onAttach.mock.calls[0][0].map(file => file.name)).toEqual(['first.jpg', 'second.jpg']);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores a stale timeline response after a newer search completes', async () => {
    const slow = deferred();
    fetchMock.mockImplementation(async url => {
      if (url.endsWith('/config')) return Response.json(config);
      if (url.includes('/timeline')) return slow.promise;
      return page([asset('new')], { mode: 'smart' });
    });
    render(<ImmichGalleryModal isOpen onClose={vi.fn()} onAttach={vi.fn()} validateTarget={vi.fn()} />);
    await waitFor(() => expect(fetchMock.mock.calls.some(([url]) => url.includes('/timeline'))).toBe(true));
    const search = screen.getByLabelText('搜索 Immich 媒体');
    fireEvent.change(search, { target: { value: 'new' } });
    fireEvent.submit(search.closest('form'));
    await screen.findByAltText('new.jpg');
    slow.resolve(page([asset('old')]));
    await waitFor(() => expect(screen.queryByAltText('old.jpg')).toBeNull());
    expect(screen.getByAltText('new.jpg')).toBeTruthy();
  });

  it('aborts pending downloads when the modal is unmounted and never attaches them', async () => {
    const slow = deferred();
    const onAttach = vi.fn();
    let downloadSignal;
    fetchMock.mockImplementation(async (url, options) => {
      if (url.endsWith('/config')) return Response.json(config);
      if (url.includes('/timeline')) return page([asset('first')]);
      downloadSignal = options.signal;
      return slow.promise;
    });
    const view = render(<ImmichGalleryModal isOpen onClose={vi.fn()} onAttach={onAttach} validateTarget={vi.fn()} />);
    fireEvent.click(await screen.findByAltText('first.jpg'));
    fireEvent.click(screen.getByText('添加到对话 (1)'));
    await waitFor(() => expect(downloadSignal).toBeTruthy());
    view.unmount();
    expect(downloadSignal.aborted).toBe(true);
    slow.resolve(new Response('bytes', { headers: { 'content-type': 'image/jpeg' } }));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(onAttach).not.toHaveBeenCalled();
    expect(document.body.style.overflow).toBe('');
  });

  it('shows attachment errors in the modal and retains the selection for retry', async () => {
    fetchMock.mockImplementation(async url => url.endsWith('/config') ? Response.json(config) : page([asset('first')]));
    const validateTarget = vi.fn(() => { throw new Error('原会话已关闭'); });
    render(<ImmichGalleryModal isOpen onClose={vi.fn()} onAttach={vi.fn()} validateTarget={validateTarget} />);
    fireEvent.click(await screen.findByAltText('first.jpg'));
    fireEvent.click(screen.getByText('添加到对话 (1)'));
    await screen.findByText(/添加到对话框失败：原会话已关闭/);
    expect(screen.getByText('添加到对话 (1)').disabled).toBe(false);
  });
});

it('lightbox safely transitions between empty and populated assets', () => {
  const view = render(<Lightbox asset={null} onClose={vi.fn()} />);
  view.rerender(<Lightbox asset={asset('preview')} onClose={vi.fn()} />);
  expect(screen.getByRole('dialog').getAttribute('aria-label')).toBe('preview.jpg');
  view.rerender(<Lightbox asset={null} onClose={vi.fn()} />);
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('cancel-adding aborts the transfer and closes the gallery without attaching files', async () => {
  const pending = deferred();
  let signal;
  const onAttach = vi.fn();
  fetchMock.mockImplementation(async (url, options) => {
    if (url.endsWith('/config')) return Response.json(config);
    if (url.includes('/timeline')) return page([asset('first')]);
    signal = options.signal;
    return pending.promise;
  });
  function Host() {
    const [open, setOpen] = React.useState(true);
    return open ? <ImmichGalleryModal isOpen onClose={() => setOpen(false)} onAttach={onAttach} validateTarget={vi.fn()} /> : <span>closed</span>;
  }
  render(<Host />);
  fireEvent.click(await screen.findByAltText('first.jpg'));
  fireEvent.click(screen.getByText('添加到对话 (1)'));
  await waitFor(() => expect(signal).toBeTruthy());
  fireEvent.click(screen.getByText('取消添加'));
  await screen.findByText('closed');
  expect(signal.aborted).toBe(true);
  pending.resolve(new Response('bytes'));
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(onAttach).not.toHaveBeenCalled();
});

it('traps focus in the gallery and closes only the preview on Escape', async () => {
  fetchMock.mockImplementation(async url => url.endsWith('/config') ? Response.json(config) : page([asset('first')]));
  const onClose = vi.fn();
  render(<ImmichGalleryModal isOpen onClose={onClose} onAttach={vi.fn()} validateTarget={vi.fn()} />);
  await screen.findByAltText('first.jpg');
  const first = screen.getByLabelText('搜索方式');
  first.focus();
  fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
  expect(document.activeElement).toBe(screen.getByText('取消'));
  const preview = screen.getByLabelText('预览 first.jpg');
  preview.focus();
  fireEvent.click(preview);
  expect(screen.getAllByRole('dialog')).toHaveLength(2);
  fireEvent.keyDown(window, { key: 'Escape' });
  await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(1));
  expect(onClose).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(preview);
});
