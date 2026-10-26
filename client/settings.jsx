import React, { useState, useEffect } from 'react';

export function ImmichSettingsView({ onSaved, standalone = false }) {
  const [config, setConfig] = useState({
    immichUrl: 'http://192.168.1.21:2283',
    apiKey: '',
    hasApiKey: false,
    videoMode: 'direct',
    maxFrames: 12,
    frameInterval: 2
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState(null);

  useEffect(() => {
    fetch('/api/immich/config')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setConfig(data);
      })
      .catch(() => {});
  }, []);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/immich/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          immichUrl: config.immichUrl,
          apiKey: config.apiKey
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ ok: true, msg: `连接成功！Immich 版本: ${data.version}` });
      } else {
        setTestResult({ ok: false, msg: data.error || '连接失败，请检查地址或 Key' });
      }
    } catch (e) {
      setTestResult({ ok: false, msg: e.message || '网络请求错误' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveNotice(null);
    try {
      const res = await fetch('/api/immich/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveNotice({ ok: true, msg: '配置已保存成功！' });
        if (onSaved) onSaved(data.config);
      } else {
        setSaveNotice({ ok: false, msg: data.error || '保存失败' });
      }
    } catch (e) {
      setSaveNotice({ ok: false, msg: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: standalone ? '20px' : '10px 0', maxWidth: '640px', color: 'inherit' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600 }}>Immich 相册连接与输入设置</h3>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', opacity: 0.85 }}>Immich 服务器地址 (URL)</label>
        <input
          type="text"
          value={config.immichUrl || ''}
          placeholder="http://192.168.1.21:2283"
          onChange={e => setConfig({ ...config, immichUrl: e.target.value })}
          style={{
            width: '100%',
            height: '36px',
            padding: '0 12px',
            background: 'var(--dsw-specific-input-major, rgba(255,255,255,0.06))',
            border: '1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.15))',
            borderRadius: '6px',
            color: 'inherit',
            fontSize: '13px'
          }}
        />
        <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>内网 Immich 服务的 Web / API 访问根地址</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', opacity: 0.85 }}>Immich API Key</label>
        <input
          type="password"
          value={config.apiKey || ''}
          placeholder={config.hasApiKey ? '已保存 Key（重新输入将覆盖）' : '请输入 Immich 生成的 API Key'}
          onChange={e => setConfig({ ...config, apiKey: e.target.value })}
          style={{
            width: '100%',
            height: '36px',
            padding: '0 12px',
            background: 'var(--dsw-specific-input-major, rgba(255,255,255,0.06))',
            border: '1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.15))',
            borderRadius: '6px',
            color: 'inherit',
            fontSize: '13px'
          }}
        />
        <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>在 Immich 网页端右上角头像 -&gt; 账户设置 -&gt; API Keys 中生成</div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          type="button"
          onClick={handleTest}
          disabled={testing}
          className="dsh-immich-btn-secondary"
          style={{ fontSize: '12px', padding: '6px 14px' }}
        >
          {testing ? '正在测试连接...' : '⚡ 测试连通性'}
        </button>
        {testResult && (
          <div style={{
            marginTop: '8px',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            background: testResult.ok ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: testResult.ok ? '#4ade80' : '#f87171'
          }}>
            {testResult.msg}
          </div>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.1))', margin: '20px 0' }} />

      <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600 }}>视频输入处理策略</h4>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <input
              type="radio"
              name="videoMode"
              value="direct"
              checked={config.videoMode === 'direct'}
              onChange={() => setConfig({ ...config, videoMode: 'direct' })}
            />
            🚀 优先直接传给模型 (Direct Pass-through)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <input
              type="radio"
              name="videoMode"
              value="frames"
              checked={config.videoMode === 'frames'}
              onChange={() => setConfig({ ...config, videoMode: 'frames' })}
            />
            🎞️ 使用视频转多帧图片 (Video-to-Frames)
          </label>
        </div>
        <div style={{ fontSize: '12px', opacity: 0.65, lineHeight: 1.5 }}>
          {config.videoMode === 'direct'
            ? '直传模式：将原视频文件直接附入对话，交给支持原生视频的多模态大模型处理。'
            : '切帧模式：将视频均匀抽取为多张静态序列关键帧图片，作为图片组添加到对话中。'}
        </div>
      </div>

      {config.videoMode === 'frames' && (
        <div style={{
          padding: '12px',
          background: 'var(--dsw-specific-input-major, rgba(255,255,255,0.03))',
          borderRadius: '8px',
          border: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.08))',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', opacity: 0.8 }}>最大抽取帧数</label>
              <input
                type="number"
                min="1"
                max="30"
                value={config.maxFrames || 12}
                onChange={e => setConfig({ ...config, maxFrames: parseInt(e.target.value, 10) || 12 })}
                style={{
                  width: '100%',
                  height: '32px',
                  padding: '0 8px',
                  background: 'inherit',
                  border: '1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.15))',
                  borderRadius: '4px',
                  color: 'inherit'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', opacity: 0.8 }}>采样间隔 (秒)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="30"
                value={config.frameInterval || 2}
                onChange={e => setConfig({ ...config, frameInterval: parseFloat(e.target.value) || 2 })}
                style={{
                  width: '100%',
                  height: '32px',
                  padding: '0 8px',
                  background: 'inherit',
                  border: '1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.15))',
                  borderRadius: '4px',
                  color: 'inherit'
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="dsh-immich-btn-primary"
        >
          {saving ? '保存中...' : '保存设置'}
        </button>
        {saveNotice && (
          <span style={{ fontSize: '13px', color: saveNotice.ok ? '#4ade80' : '#f87171' }}>
            {saveNotice.msg}
          </span>
        )}
      </div>
    </div>
  );
}
