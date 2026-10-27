import React, { useEffect, useRef } from 'react';
import { activateDialog } from './dialog.mjs';
import { IconClose } from './icons.jsx';

export function Lightbox({ asset, onClose }) {
  const dialogRef = useRef(null);
  useEffect(() => { if (asset) return activateDialog(dialogRef.current); }, [Boolean(asset)]);
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') { e.stopImmediatePropagation(); onClose(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!asset) return null;

  const isVideo = asset.type === 'video';
  const previewUrl = isVideo
    ? `/api/immich/original?id=${encodeURIComponent(asset.id)}`
    : `/api/immich/thumbnail?id=${encodeURIComponent(asset.id)}&size=preview`;

  return (
    <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={asset.originalFileName} className="dsh-immich-lightbox" onClick={onClose}>
      <div className="dsh-immich-lightbox-header" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{asset.originalFileName}</span>
          <span style={{ fontSize: 12, opacity: 0.6 }}>{asset.fileCreatedAt ? new Date(asset.fileCreatedAt).toLocaleString() : '拍摄时间未知'}</span>
        </div>
        <button type="button" aria-label="关闭预览" className="dsh-immich-icon-btn" onClick={onClose} style={{ color: '#fff' }}>
          <IconClose size={20} />
        </button>
      </div>

      <div className="dsh-immich-lightbox-content" onClick={onClose}>
        {isVideo ? (
          <video
            className="dsh-immich-lightbox-video"
            src={previewUrl}
            controls
            autoPlay
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <img
            className="dsh-immich-lightbox-img"
            src={previewUrl}
            alt={asset.originalFileName}
            onClick={e => e.stopPropagation()}
          />
        )}
      </div>
    </div>
  );
}
