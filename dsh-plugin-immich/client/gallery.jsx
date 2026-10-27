import React, { useState, useEffect, useRef } from 'react';
import {
  IconImmich,
  IconSearch,
  IconVideo,
  IconCheck,
  IconClose,
  IconSettings,
  IconSparkles,
  IconZoomIn
} from './icons.jsx';
import { activateDialog } from './dialog.mjs';
import { formatDuration } from '../src/media.mjs';
import { Lightbox } from './lightbox.jsx';
import { ImmichSettingsView } from './settings.jsx';

export function ImmichGalleryModal({ isOpen, onClose, onAttach, validateTarget }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [isSmartSearch, setIsSmartSearch] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState(new Map());
  const [searchMode, setSearchMode] = useState('auto');
  const [videoMode, setVideoMode] = useState('direct');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [previewAsset, setPreviewAsset] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState('');

  const bodyRef = useRef(null);
  const dialogRef = useRef(null);
  const requestRef = useRef(null);
  const submitRef = useRef(null);
  const submittingRef = useRef(false);
  const activeSearch = useRef({ query: '', mode: 'auto' });

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
      let endpoint = '/api/immich/timeline';
      if (search.query) {
        endpoint = '/api/immich/search';
        params.set('q', search.query);
        params.set('mode', search.mode);
      }
      const res = await fetch(`${endpoint}?${params}`, { signal: controller.signal });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '获取媒体失败');
      if (controller.signal.aborted) return;
      setAssets(previous => [...new Map((reset ? data.items || [] : [...previous, ...(data.items || [])]).map(item => [item.id, item])).values()]);
      setPage(targetPage);
      setHasMore(Boolean(data.hasMore));
      setIsSmartSearch(Boolean(data.smartSearch));
      if (search.query) activeSearch.current = { ...search, mode: data.mode || search.mode };
    } catch (error) {
      if (!controller.signal.aborted) setError(error.message);
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    setQuery('');
    setSelectedAssets(new Map());
    setPreviewAsset(null);
    setLoading(true);
    fetch('/api/immich/config', { signal: controller.signal })
      .then(async res => {
        const config = await res.json();
        if (!res.ok) throw new Error(config.error || '无法读取配置');
        if (controller.signal.aborted) return;
        setVideoMode(config.videoMode || 'direct');
        setShowSettings(!config.hasApiKey);
        if (config.hasApiKey) loadAssets(1, true, { query: '', mode: 'auto' });
        else setLoading(false);
      })
      .catch(error => { if (!controller.signal.aborted) { setError(error.message); setShowSettings(true); setLoading(false); } });
    return () => {
      controller.abort();
      requestRef.current?.abort();
      requestRef.current = null;
      submitRef.current?.abort();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = event => {
      if (event.key === 'Escape') {
        if (previewAsset) setPreviewAsset(null);
        else if (!submittingRef.current) onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, previewAsset, onClose]);

  useEffect(() => {
    if (isOpen) return activateDialog(dialogRef.current);
  }, [isOpen]);

  const handleSearch = event => {
    event?.preventDefault();
    loadAssets(1, true, { query: query.trim(), mode: searchMode });
  };

  const toggleSelect = item => {
    setSelectedAssets(previous => {
      const next = new Map(previous);
      if (next.has(item.id)) next.delete(item.id);
      else next.set(item.id, item);
      return next;
    });
  };

  // 添加选中的图片/视频到 DSH 会话输入框
  const handleAddToConversation = async () => {
    if (selectedAssets.size === 0 || submittingRef.current) return;
    submittingRef.current = true;
    const controller = new AbortController();
    submitRef.current = controller;
    setSubmitting(true);
    setSubmitProgress('正在准备素材...');

    try {
      validateTarget();
      const targetAssets = [...selectedAssets.values()];
      const filesToInject = [];

      for (let i = 0; i < targetAssets.length; i++) {
        controller.signal.throwIfAborted();
        const item = targetAssets[i];
        setSubmitProgress(`正在获取 (${i + 1}/${targetAssets.length}): ${item.originalFileName}...`);

        if (item.type === 'video') {
          if (videoMode === 'direct') {
            // 直传模式：下载原视频作为 File
            const res = await fetch(`/api/immich/original?id=${encodeURIComponent(item.id)}`, { signal: controller.signal });
            if (!res.ok) throw new Error(`获取视频失败: ${item.originalFileName}`);
            const blob = await res.blob();
            filesToInject.push(new File([blob], item.originalFileName, { type: blob.type || 'video/mp4' }));
          } else {
            // 切帧模式：调用切帧 API 抽取多张帧图片
            setSubmitProgress(`正在抽取视频帧: ${item.originalFileName}...`);
            const res = await fetch('/api/immich/convert-frames', {
              signal: controller.signal,
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: item.id })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `视频切帧失败: ${item.originalFileName}`);

            for (const frame of data.frames || []) {
              const byteCharacters = atob(frame.base64);
              const byteNumbers = new Array(byteCharacters.length);
              for (let j = 0; j < byteCharacters.length; j++) {
                byteNumbers[j] = byteCharacters.charCodeAt(j);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const frameBlob = new Blob([byteArray], { type: 'image/jpeg' });
              filesToInject.push(new File([frameBlob], frame.name, { type: 'image/jpeg' }));
            }
          }
        } else {
          // 图片模式：获取原图
          const res = await fetch(`/api/immich/original?id=${encodeURIComponent(item.id)}`, { signal: controller.signal });
          if (!res.ok) throw new Error(`获取图片失败: ${item.originalFileName}`);
          const blob = await res.blob();
          filesToInject.push(new File([blob], item.originalFileName, { type: blob.type || 'image/jpeg' }));
        }
      }

      setSubmitProgress('正在载入对话框输入区...');

      if (controller.signal.aborted) return;
      onAttach(filesToInject);

      // 成功后关闭弹窗
      onClose();
    } catch (err) {
      if (!controller.signal.aborted) setError('添加到对话框失败：' + err.message);
    } finally {
      submittingRef.current = false;
      if (!controller.signal.aborted) { setSubmitting(false); setSubmitProgress(''); }
      submitRef.current = null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dsh-immich-modal-backdrop" onClick={() => { if (!submittingRef.current) onClose(); }}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Immich 相册" aria-busy={submitting} className="dsh-immich-modal-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="dsh-immich-header">
          <div className="dsh-immich-title-box">
            <IconImmich size={22} color="#6366f1" />
            <span>Immich 相册</span>
          </div>

          {!showSettings && (
            <form inert={submitting ? '' : undefined} className="dsh-immich-search-bar" onSubmit={handleSearch}>
              <span className="dsh-immich-search-icon">
                {isSmartSearch ? <IconSparkles size={16} color="#818cf8" /> : <IconSearch size={16} />}
              </span>
              <select aria-label="搜索方式" value={searchMode} onChange={event => setSearchMode(event.target.value)} style={{ background: 'transparent', color: 'inherit', maxWidth: 90 }}>
                <option value="auto">自动</option>
                <option value="smart">智能搜图</option>
                <option value="filename">文件名</option>
              </select>
              <input
                aria-label="搜索 Immich 媒体"
                type="text"
                className="dsh-immich-search-input"
                placeholder="按文件名搜索或自然语言搜图（CLIP 智能搜图）..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button type="button" className="dsh-immich-search-clear" onClick={() => { setQuery(''); loadAssets(1, true, { query: '', mode: 'auto' }); }}>
                  <IconClose size={14} />
                </button>
              )}
            </form>
          )}

          {!showSettings && (
            <div className="dsh-immich-video-mode-switch" title="选择视频素材输入策略">
              <button
                type="button"
                className={`dsh-immich-video-mode-btn ${videoMode === 'direct' ? 'active' : ''}`}
                disabled={submitting} onClick={() => setVideoMode('direct')}
              >
                🚀 直传模型
              </button>
              <button
                type="button"
                className={`dsh-immich-video-mode-btn ${videoMode === 'frames' ? 'active' : ''}`}
                disabled={submitting} onClick={() => setVideoMode('frames')}
              >
                🎞️ 切帧多图
              </button>
            </div>
          )}

          <button
            type="button"
            className={`dsh-immich-icon-btn ${showSettings ? 'active' : ''}`}
            title="Immich 设置"
            disabled={submitting} onClick={() => { requestRef.current?.abort(); setShowSettings(!showSettings); }}
          >
            <IconSettings size={18} />
          </button>

          <button type="button" className="dsh-immich-icon-btn" disabled={submitting} onClick={onClose} title="关闭" aria-label="关闭相册">
            <IconClose size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="dsh-immich-body" ref={bodyRef}>
          {showSettings ? (
            <ImmichSettingsView
              standalone={false}
              onSaved={config => {
                setVideoMode(config.videoMode);
                setSelectedAssets(new Map());
                setQuery('');
                setShowSettings(!config.hasApiKey);
                if (config.hasApiKey) loadAssets(1, true, { query: '', mode: 'auto' });
              }}
            />
          ) : (
            <>
              {error && (
                <div role="alert" style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#f87171',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{error}</span>
                  <button className="dsh-immich-btn-secondary" onClick={() => setShowSettings(true)} style={{ padding: '4px 10px' }}>
                    检查设置
                  </button>
                </div>
              )}

              {loading && assets.length === 0 && (
                <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.6 }}>
                  正在连接 Immich 加载媒体资源...
                </div>
              )}

              {!loading && assets.length === 0 && !error && (
                <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.6 }}>
                  {query ? '未找到相关照片或视频' : '相册暂无媒体内容'}
                </div>
              )}

              <div className="dsh-immich-grid">
                {assets.map(item => {
                  const isSelected = selectedAssets.has(item.id);
                  const isVideo = item.type === 'video';
                  return (
                    <div
                      key={item.id}
                      className={`dsh-immich-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => { if (!submitting) toggleSelect(item); }}
                      onDoubleClick={() => setPreviewAsset(item)}
                      title={`${item.originalFileName} (双击预览)`}
                    >
                      <img
                        className="dsh-immich-thumb"
                        src={`/api/immich/thumbnail?id=${encodeURIComponent(item.id)}&size=thumbnail`}
                        alt={item.originalFileName}
                        loading="lazy"
                      />

                      <button type="button" className="dsh-immich-check" disabled={submitting} aria-label={`选择 ${item.originalFileName}`} aria-pressed={isSelected} onClick={event => { event.stopPropagation(); toggleSelect(item); }}>
                        {isSelected && <IconCheck size={14} color="#fff" />}
                      </button>

                      {isVideo && (
                        <div className="dsh-immich-badge">
                          <IconVideo size={12} color="#fff" />
                          <span>{formatDuration(item.duration)}</span>
                        </div>
                      )}

                      <button type="button" aria-label={`预览 ${item.originalFileName}`}
                        className="dsh-immich-card-zoom"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewAsset(item);
                        }}
                        title="大图全屏预览"
                      >
                        <IconZoomIn size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {hasMore && !loading && (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <button
                    type="button"
                    className="dsh-immich-btn-secondary"
                    disabled={submitting} onClick={() => loadAssets(page + 1)}
                  >
                    加载更多媒体...
                  </button>
                </div>
              )}

              {loading && assets.length > 0 && (
                <div style={{ textAlign: 'center', padding: '16px 0', opacity: 0.6 }}>
                  加载中...
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!showSettings && (
          <div className="dsh-immich-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px' }}>
                已选 <strong>{selectedAssets.size}</strong> 项
              </span>
              {selectedAssets.size > 0 && (
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '12px' }}
                  disabled={submitting} onClick={() => setSelectedAssets(new Map())}
                >
                  清空已选
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {submitting && (
                <span style={{ fontSize: '12px', opacity: 0.75 }}>{submitProgress}</span>
              )}
              <button
                type="button"
                className="dsh-immich-btn-secondary"
                onClick={() => { submitRef.current?.abort(); onClose(); }}
              >
                {submitting ? '取消添加' : '取消'}
              </button>
              <button
                type="button"
                className="dsh-immich-btn-primary"
                disabled={selectedAssets.size === 0 || submitting}
                onClick={handleAddToConversation}
              >
                {submitting ? '添加中...' : `添加到对话 (${selectedAssets.size})`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox 大图/视频播放 */}
      {previewAsset && (
        <Lightbox asset={previewAsset} onClose={() => setPreviewAsset(null)} />
      )}
    </div>
  );
}
