import React, { useEffect } from 'react';
import { IconClose } from './icons.jsx';

export function Lightbox({ asset, onClose }) {
  if (!asset) return null;

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const isVideo = asset.type === 'video';
  const previewUrl = `/api/immich/original?id=${asset.id}`;

  return (
    <div className="dsh-immich-lightbox" onClick={onClose}>
      <div className="dsh-immich-lightbox-header" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{asset.originalFileName}</span>
          <span style={{ fontSize: 12, opacity: 0.6 }}>{new Date(asset.fileCreatedAt).toLocaleString()}</span>
        </div>
        <button className="dsh-immich-icon-btn" onClick={onClose} style={{ color: '#fff' }}>
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
