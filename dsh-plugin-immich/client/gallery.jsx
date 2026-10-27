import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Lightbox } from './lightbox.jsx';
import { ImmichSettingsView } from './settings.jsx';

export function ImmichGalleryModal({ isOpen, onClose }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [isSmartSearch, setIsSmartSearch] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [videoMode, setVideoMode] = useState('direct');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [previewAsset, setPreviewAsset] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState('');

  const bodyRef = useRef(null);

  // 初始化加载配置
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/immich/config')
      .then(res => res.json())
      .then(cfg => {
        if (cfg.videoMode) setVideoMode(cfg.videoMode);
        if (!cfg.hasApiKey) {
          setShowSettings(true);
        } else {
          loadTimeline(1, true);
        }
      })
      .catch(() => setShowSettings(true));
  }, [isOpen]);

  const loadTimeline = async (targetPage = 1, reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/immich/timeline?page=${targetPage}&size=50`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '获取时间线失败');
      setAssets(prev => reset ? (data.items || []) : [...prev, ...(data.items || [])]);
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
      const res = await fetch('/api/immich/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, page: 1, size: 60 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '搜索失败');
      setAssets(data.items || []);
      setPage(1);
      setHasMore(data.hasMore || false);
      setIsSmartSearch(data.smartSearch || false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 格式化时长（兼容 Immich 毫秒、秒及时分秒字符串）
  const formatDuration = (val) => {
    if (val === null || val === undefined || val === '') return '';

    let totalSeconds = 0;
    if (typeof val === 'number') {
      // Immich 返回的 duration 字段为整数毫秒（如 9334 代表 9.33 秒）
      if (Number.isInteger(val) && val > 200) {
        totalSeconds = Math.round(val / 1000);
      } else {
        totalSeconds = Math.round(val);
      }
    } else if (typeof val === 'string') {
      if (val.includes(':')) {
        const parts = val.split(':').map(p => parseFloat(p) || 0);
        if (parts.length === 3) {
          totalSeconds = Math.round(parts[0] * 3600 + parts[1] * 60 + parts[2]);
        } else if (parts.length === 2) {
          totalSeconds = Math.round(parts[0] * 60 + parts[1]);
        }
      } else {
        const num = parseFloat(val);
        if (!Number.isNaN(num)) {
          totalSeconds = (Number.isInteger(num) && num > 200) ? Math.round(num / 1000) : Math.round(num);
        }
      }
    }

    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '';

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // 添加选中的图片/视频到 DSH 会话输入框
  const handleAddToConversation = async () => {
    if (selectedIds.size === 0 || submitting) return;
    setSubmitting(true);
    setSubmitProgress('正在准备素材...');

    try {
      const targetAssets = assets.filter(a => selectedIds.has(a.id));
      const filesToInject = [];

      for (let i = 0; i < targetAssets.length; i++) {
        const item = targetAssets[i];
        setSubmitProgress(`正在获取 (${i + 1}/${targetAssets.length}): ${item.originalFileName}...`);

        if (item.type === 'video') {
          if (videoMode === 'direct') {
            // 直传模式：下载原视频作为 File
            const res = await fetch(`/api/immich/original?id=${item.id}`);
            if (!res.ok) throw new Error(`获取视频失败: ${item.originalFileName}`);
            const blob = await res.blob();
            filesToInject.push(new File([blob], item.originalFileName, { type: blob.type || 'video/mp4' }));
          } else {
            // 切帧模式：调用切帧 API 抽取多张帧图片
            setSubmitProgress(`正在抽取视频帧: ${item.originalFileName}...`);
            const res = await fetch('/api/immich/convert-frames', {
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
          const res = await fetch(`/api/immich/original?id=${item.id}`);
          if (!res.ok) throw new Error(`获取图片失败: ${item.originalFileName}`);
          const blob = await res.blob();
          filesToInject.push(new File([blob], item.originalFileName, { type: blob.type || 'image/jpeg' }));
        }
      }

      setSubmitProgress('正在载入对话框输入区...');

      // 寻找 DSH 会话输入框的文件上传 input 元素并注入
      const fileInput = document.querySelector('input[type="file"][multiple]');
      if (fileInput) {
        const dt = new DataTransfer();
        for (const f of filesToInject) {
          dt.items.add(f);
        }
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        throw new Error('未找到对话框输入框的文件接收通道，请确保位于会话页面。');
      }

      // 成功后关闭弹窗
      onClose();
    } catch (err) {
      alert('添加到对话框失败：' + err.message);
    } finally {
      setSubmitting(false);
      setSubmitProgress('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dsh-immich-modal-backdrop" onClick={onClose}>
      <div className="dsh-immich-modal-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="dsh-immich-header">
          <div className="dsh-immich-title-box">
            <IconImmich size={22} color="#6366f1" />
            <span>Immich 相册</span>
          </div>

          {!showSettings && (
            <form className="dsh-immich-search-bar" onSubmit={handleSearch}>
              <span className="dsh-immich-search-icon">
                {isSmartSearch ? <IconSparkles size={16} color="#818cf8" /> : <IconSearch size={16} />}
              </span>
              <input
                type="text"
                className="dsh-immich-search-input"
                placeholder="按文件名搜索或自然语言搜图（CLIP 智能搜图）..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button type="button" className="dsh-immich-search-clear" onClick={() => { setQuery(''); loadTimeline(1, true); }}>
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
                onClick={() => setVideoMode('direct')}
              >
                🚀 直传模型
              </button>
              <button
                type="button"
                className={`dsh-immich-video-mode-btn ${videoMode === 'frames' ? 'active' : ''}`}
                onClick={() => setVideoMode('frames')}
              >
                🎞️ 切帧多图
              </button>
            </div>
          )}

          <button
            type="button"
            className={`dsh-immich-icon-btn ${showSettings ? 'active' : ''}`}
            title="Immich 设置"
            onClick={() => setShowSettings(!showSettings)}
          >
            <IconSettings size={18} />
          </button>

          <button type="button" className="dsh-immich-icon-btn" onClick={onClose} title="关闭">
            <IconClose size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="dsh-immich-body" ref={bodyRef}>
          {showSettings ? (
            <ImmichSettingsView
              standalone={false}
              onSaved={() => {
                setShowSettings(false);
                loadTimeline(1, true);
              }}
            />
          ) : (
            <>
              {error && (
                <div style={{
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
                  const isSelected = selectedIds.has(item.id);
                  const isVideo = item.type === 'video';
                  return (
                    <div
                      key={item.id}
                      className={`dsh-immich-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleSelect(item.id)}
                      onDoubleClick={() => setPreviewAsset(item)}
                      title={`${item.originalFileName} (双击预览)`}
                    >
                      <img
                        className="dsh-immich-thumb"
                        src={`/api/immich/thumbnail?id=${item.id}&size=thumbnail`}
                        alt={item.originalFileName}
                        loading="lazy"
                      />

                      <div className="dsh-immich-check">
                        {isSelected && <IconCheck size={14} color="#fff" />}
                      </div>

                      {isVideo && (
                        <div className="dsh-immich-badge">
                          <IconVideo size={12} color="#fff" />
                          <span>{formatDuration(item.duration)}</span>
                        </div>
                      )}

                      <div
                        className="dsh-immich-card-zoom"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewAsset(item);
                        }}
                        title="大图全屏预览"
                      >
                        <IconZoomIn size={14} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasMore && !loading && (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <button
                    type="button"
                    className="dsh-immich-btn-secondary"
                    onClick={() => loadTimeline(page + 1)}
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
                已选 <strong>{selectedIds.size}</strong> 项
              </span>
              {selectedIds.size > 0 && (
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '12px' }}
                  onClick={() => setSelectedIds(new Set())}
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
                onClick={onClose}
                disabled={submitting}
              >
                取消
              </button>
              <button
                type="button"
                className="dsh-immich-btn-primary"
                disabled={selectedIds.size === 0 || submitting}
                onClick={handleAddToConversation}
              >
                {submitting ? '添加中...' : `添加到对话 (${selectedIds.size})`}
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
